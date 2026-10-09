import { createClient } from 'jsr:@supabase/supabase-js@2'
import { z } from 'npm:zod@3'

// ─────────────────────────────────────────────────────────────────────────────
// fiatt-session-emails
// Public API for the foraisso.com /agende form.
// Security layers (in order): CORS allowlist → method/size checks → honeypot →
// Cloudflare Turnstile → strict allowlist schema (zod) → IP/email rate limit →
// explicit column mapping (no payload spread) → HTML escaping on email output.
// ─────────────────────────────────────────────────────────────────────────────

const MAX_BODY_BYTES = 64 * 1024
const RATE_LIMIT_PER_IP_PER_HOUR = 3
const RATE_LIMIT_PER_PERSON_PER_DAY = 3
const ADMIN_EMAIL = 'leo.zerino@gmail.com'

const DEFAULT_ALLOWED_ORIGINS = [
  'https://foraisso.com',
  'https://www.foraisso.com',
  'http://localhost:8080',
  'http://localhost:3000'
]

const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)

const ALLOWED_ORIGINS =
  allowedOrigins.length > 0 ? allowedOrigins : DEFAULT_ALLOWED_ORIGINS

function buildCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin'
  }
  if (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)) {
    headers['Access-Control-Allow-Origin'] = requestOrigin
  }
  return headers
}

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  corsHeaders: Record<string, string>
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Escapes user data before interpolating it into HTML email templates. */
function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/** Escapes LIKE wildcards so user input is matched literally by ilike. */
function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, character => `\\${character}`)
}

function getClientIp(req: Request): string {
  const forwardedFor =
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    ''
  return forwardedFor.split(',')[0].trim() || '0.0.0.0'
}

async function hashIp(ip: string): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(ip)
  )
  return Array.from(new Uint8Array(hashBuffer))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, 32)
}

async function verifyTurnstileToken(
  token: string,
  secret: string,
  remoteIp?: string
): Promise<boolean> {
  if (!token || !secret) return false

  const body = new FormData()
  body.append('secret', secret)
  body.append('response', token)
  if (remoteIp) body.append('remoteip', remoteIp)

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { method: 'POST', body }
    )
    if (!response.ok) {
      console.error('[fiatt] Turnstile HTTP error:', response.status)
      return false
    }
    const data = (await response.json()) as {
      success: boolean
      'error-codes'?: string[]
    }
    if (!data.success) {
      console.warn('[fiatt] Turnstile failed:', data['error-codes'])
    }
    return data.success === true
  } catch (error) {
    console.error('[fiatt] Turnstile exception:', error)
    return false
  }
}

// ── Allowed option values (must match the frontend & legacy Google Forms) ────

const FORM_TYPES = ['privada', 'fotografica'] as const
type FormType = (typeof FORM_TYPES)[number]

const RISK_LEVELS = ['limite rígido', 'indiferente', 'desejável'] as const
const IDENTIFIES_AS = ['Bottom', 'Top', 'Switcher'] as const
const YES_NO = ['Sim', 'Não'] as const

const INTENSITY_OPTIONS: Record<FormType, readonly string[]> = {
  privada: [
    'Suave, quero ser abraçade pelas cordas com condução leve',
    'Intermediário, quero sentir bem as cordas e ser conduzide com mais firmeza',
    'Intenso, quero sensações profundas e uma condução severa',
    'Dolorido, quero o desconforto'
  ],
  fotografica: [
    'Suave, quero posições fáceis e leves',
    'Intermediário, quero posições um pouco desafiadoras',
    'Intenso, quero posições mais desafiadoras',
    'Máximo, quero tudo que você tem a oferecer!'
  ]
}

const PAIN_OPTIONS: Record<FormType, readonly string[]> = {
  privada: [
    'Nenhuma relação, simplesmente odeio',
    'Gosto de alguma sensação leve',
    'Gosto de sensações um pouco mais intensas',
    '(No pain, no gain) Sem dor não tem graça'
  ],
  fotografica: ['Baixa', 'Média', 'Alta']
}

const SOCIAL_MEDIA_OPTIONS: Record<FormType, readonly string[]> = {
  privada: ['Sim', 'Não'],
  fotografica: ['Sim', 'Não', 'Apenas como collab']
}

const DECLARATION_TEXT = 'Estou ciente e confirmo'

// ── Schema ───────────────────────────────────────────────────────────────────

// Removes ASCII control characters (keeps \t, \n, \r) and normalizes unicode.
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g

const cleanText = (maxLength: number) =>
  z
    .string()
    .transform(value => value.normalize('NFC').replace(CONTROL_CHARS, '').trim())
    .pipe(z.string().max(maxLength))

const requiredText = (maxLength: number) =>
  cleanText(maxLength).pipe(z.string().min(1))

const optionalText = (maxLength: number) =>
  cleanText(maxLength)
    .optional()
    .nullable()
    .transform(value => (value ? value : null))

const riskLevel = z.enum(RISK_LEVELS)

const payloadSchema = z
  .object({
    form_type: z.enum(FORM_TYPES),
    turnstileToken: z.string().min(1).max(4096),
    website: z.string().max(200).optional(), // honeypot

    // Section 1 — identity
    full_name: requiredText(120).pipe(z.string().min(2)),
    email: cleanText(254)
      .transform(value => value.toLowerCase())
      .pipe(z.string().email()),
    pseudonym: optionalText(80),
    pronouns: optionalText(40),
    age: z.number().int().min(18).max(120),
    whatsapp: z.string().regex(/^\+[1-9]\d{7,14}$/),
    social_media: requiredText(300),
    desired_date: optionalText(40),
    body_modification_planned: z.boolean(),
    body_modification_details: optionalText(1000),

    // Section 2 — experiences, limits & desires
    identifies_as: z.enum(IDENTIFIES_AS).optional().nullable(),
    shibari_experience: optionalText(2000),
    session_intensity: requiredText(200),
    pain_relation: requiredText(200),
    emotional_limits: requiredText(2000),
    shibari_motivation: requiredText(2000),
    activities_not_desired: optionalText(2000),
    desired_activities_positions: optionalText(2000),
    fetishes_non_conventional: optionalText(2000),
    can_hang_upside_down: z.boolean().optional().nullable(),
    risk_blindfold: riskLevel,
    risk_hair_pulling: riskLevel,
    risk_breath_play: riskLevel,
    risk_neck_rope: riskLevel,
    risk_rope_gag: riskLevel,
    risk_matanawa: riskLevel,
    risk_nipple_rope: riskLevel,
    risk_toe_rope: riskLevel,

    // Section 3 — health & safety
    medical_conditions_overview: requiredText(2000),
    has_diabetes: z.boolean(),
    has_blood_pressure_issues: z.boolean(),
    has_asthma: z.boolean(),
    has_epilepsy: z.boolean(),
    has_osteopenia: requiredText(500),
    has_hemophilia: z.boolean(),
    has_peripheral_neuropathy: z.boolean(),
    has_joint_subluxation: z.boolean(),
    has_prosthesis: z.boolean(),
    has_stroke_history: z.boolean(),
    has_hernia: requiredText(500),
    movement_restrictions: requiredText(2000),
    neurodivergence: requiredText(1000),
    continuous_medication: requiredText(1000),
    surgery_or_injury: requiredText(1000),
    allergies: requiredText(500),

    // Section 4 — results & expectations
    safeword: optionalText(80),
    stop_signal: optionalText(500),
    authorizes_media: z.enum(YES_NO).optional().nullable(),
    authorizes_social_media: requiredText(40),
    hidden_body_parts: optionalText(1000),
    session_expectations: optionalText(2000),
    frequency_expectations: optionalText(500),
    additional_info: optionalText(3000),
    declaration_truth: z.literal(DECLARATION_TEXT)
  })
  .strict()
  .superRefine((data, context) => {
    const formType = data.form_type
    const requireOption = (
      field: 'session_intensity' | 'pain_relation' | 'authorizes_social_media',
      options: readonly string[]
    ) => {
      if (!options.includes(data[field])) {
        context.addIssue({ code: 'custom', path: [field], message: 'invalid option' })
      }
    }
    requireOption('session_intensity', INTENSITY_OPTIONS[formType])
    requireOption('pain_relation', PAIN_OPTIONS[formType])
    requireOption('authorizes_social_media', SOCIAL_MEDIA_OPTIONS[formType])

    if (data.body_modification_planned && !data.body_modification_details) {
      context.addIssue({
        code: 'custom',
        path: ['body_modification_details'],
        message: 'required'
      })
    }
    if (formType === 'privada') {
      if (!data.authorizes_media) {
        context.addIssue({ code: 'custom', path: ['authorizes_media'], message: 'required' })
      }
      if (!data.session_expectations) {
        context.addIssue({ code: 'custom', path: ['session_expectations'], message: 'required' })
      }
    }
  })

type FiattPayload = z.infer<typeof payloadSchema>

/** Explicit column mapping — only these keys can ever reach the database. */
function buildRecord(payload: FiattPayload, personId: string, ipHash: string) {
  const isPrivate = payload.form_type === 'privada'
  return {
    person_id: personId,
    ip_hash: ipHash,
    form_type: payload.form_type,
    pseudonym: payload.pseudonym,
    age: payload.age,
    pronouns: payload.pronouns,
    social_media: payload.social_media,
    desired_date: payload.desired_date,
    body_modification_planned: payload.body_modification_planned,
    body_modification_details: payload.body_modification_planned
      ? payload.body_modification_details
      : null,
    identifies_as: payload.identifies_as ?? null,
    session_intensity: payload.session_intensity,
    shibari_experience: payload.shibari_experience,
    pain_relation: payload.pain_relation,
    emotional_limits: payload.emotional_limits,
    activities_not_desired: isPrivate ? payload.activities_not_desired : null,
    shibari_motivation: payload.shibari_motivation,
    desired_activities_positions: payload.desired_activities_positions,
    fetishes_non_conventional: isPrivate ? payload.fetishes_non_conventional : null,
    can_hang_upside_down: payload.can_hang_upside_down ?? null,
    risk_blindfold: payload.risk_blindfold,
    risk_hair_pulling: payload.risk_hair_pulling,
    risk_breath_play: payload.risk_breath_play,
    risk_neck_rope: payload.risk_neck_rope,
    risk_rope_gag: payload.risk_rope_gag,
    risk_matanawa: payload.risk_matanawa,
    risk_nipple_rope: payload.risk_nipple_rope,
    risk_toe_rope: payload.risk_toe_rope,
    medical_conditions_overview: payload.medical_conditions_overview,
    has_diabetes: payload.has_diabetes,
    has_blood_pressure_issues: payload.has_blood_pressure_issues,
    has_asthma: payload.has_asthma,
    has_epilepsy: payload.has_epilepsy,
    has_osteopenia: payload.has_osteopenia,
    has_hemophilia: payload.has_hemophilia,
    has_peripheral_neuropathy: payload.has_peripheral_neuropathy,
    has_joint_subluxation: payload.has_joint_subluxation,
    has_prosthesis: payload.has_prosthesis,
    has_stroke_history: payload.has_stroke_history,
    has_hernia: payload.has_hernia,
    movement_restrictions: payload.movement_restrictions,
    neurodivergence: payload.neurodivergence,
    continuous_medication: payload.continuous_medication,
    surgery_or_injury: payload.surgery_or_injury,
    allergies: payload.allergies,
    safeword: payload.safeword,
    stop_signal: payload.stop_signal,
    authorizes_media: isPrivate ? payload.authorizes_media ?? null : null,
    authorizes_social_media: payload.authorizes_social_media,
    hidden_body_parts: payload.hidden_body_parts,
    session_expectations: isPrivate ? payload.session_expectations : null,
    frequency_expectations: isPrivate ? payload.frequency_expectations : null,
    additional_info: payload.additional_info,
    declaration_truth: payload.declaration_truth
  }
}

type FiattRecord = ReturnType<typeof buildRecord>

// ── Email templates (every user value goes through escapeHtml) ──────────────

const FIELD_LABELS: Partial<Record<keyof FiattRecord, string>> = {
  form_type: 'Tipo de Sessão',
  desired_date: 'Data desejada',
  body_modification_planned: 'Pretende modificar o corpo?',
  body_modification_details: 'Detalhes da modificação',
  identifies_as: 'Identifica-se como',
  session_intensity: 'Intensidade desejada',
  shibari_experience: 'Experiência prévia',
  pain_relation: 'Relação com a dor',
  emotional_limits: 'Limites emocionais',
  activities_not_desired: 'Atividades NÃO desejadas',
  shibari_motivation: 'Motivação',
  desired_activities_positions: 'Atividades/Posições desejadas',
  fetishes_non_conventional: 'Fetiches',
  can_hang_upside_down: 'Consegue ficar de ponta cabeça?',
  risk_blindfold: 'Venda nos olhos',
  risk_hair_pulling: 'Amarrações no cabelo (puxando)',
  risk_breath_play: 'Jogos de respiração',
  risk_neck_rope: 'Corda no pescoço',
  risk_rope_gag: 'Mordaça de corda',
  risk_matanawa: 'Matanawa',
  risk_nipple_rope: 'Corda nos mamilos',
  risk_toe_rope: 'Corda no dedão do pé',
  medical_conditions_overview: 'Visão geral médica',
  has_diabetes: 'Diabetes?',
  has_blood_pressure_issues: 'Hipotensão/Hipertensão?',
  has_asthma: 'Asma?',
  has_epilepsy: 'Epilepsia?',
  has_osteopenia: 'Osteopenia/Osteoporose',
  has_hemophilia: 'Hemofilia?',
  has_peripheral_neuropathy: 'Neuropatia Periférica?',
  has_joint_subluxation: 'Luxação/Subluxação?',
  has_prosthesis: 'Prótese?',
  has_stroke_history: 'Histórico de AVC?',
  has_hernia: 'Hérnia/Compressão medular',
  movement_restrictions: 'Restrições de movimento',
  neurodivergence: 'Neurodivergência',
  continuous_medication: 'Medicação contínua',
  surgery_or_injury: 'Cirurgias/Lesões',
  allergies: 'Alergias',
  safeword: 'Palavra de segurança',
  stop_signal: 'Sinal de parada',
  authorizes_media: 'Autoriza registros?',
  authorizes_social_media: 'Autoriza redes sociais?',
  hidden_body_parts: 'Partes do corpo a ocultar',
  session_expectations: 'Expectativas da sessão',
  frequency_expectations: 'Expectativa de frequência',
  additional_info: 'Informações adicionais',
  declaration_truth: 'Declaração de veracidade'
}

function formatResponses(record: FiattRecord): string {
  let html = ''
  for (const [key, label] of Object.entries(FIELD_LABELS)) {
    const value = record[key as keyof FiattRecord]
    if (value === null || value === undefined || value === '') continue
    const displayValue =
      typeof value === 'boolean' ? (value ? 'Sim' : 'Não') : String(value)
    html += `
      <p style="margin-bottom: 8px;">${escapeHtml(label)}:<br/>
      <span style="font-size:1.1em; font-weight: bold; color:#333; white-space: pre-wrap;">${escapeHtml(displayValue)}</span></p>
    `
  }
  return html
}

function getClientEmailHtml(name: string, formType: FormType, responsesHtml: string): string {
  const formattedType = formType === 'fotografica' ? 'fotográfica' : 'privada'
  return `
<div style="font-family:Arial, sans-serif; font-size: 14px; color:#111; line-height:1.45; max-width:600px;">
  <h1>Obrigado por preencher o formulário de sessão ${formattedType}!</h1>
  <p>Leia atentamente os itens deste e-mail para confirmar sua sessão!</p>

  <h3>✨ Preparação para sua sessão de Shibari</h3>

  <p>Olá ${escapeHtml(name)},</p>

  <p>Para que sua experiência seja confortável e segura, por favor siga estas orientações:</p>
  <ul>
    <li>Alimente-se de forma leve e hidrate-se bem antes da sessão.</li>
    <li>Use roupas confortáveis e fáceis de trocar.</li>
    <li>Evite álcool ou qualquer substância que altere a consciência.</li>
    <li>Venha com disposição para comunicar seus limites com clareza.</li>
  </ul>

  <hr style="border:none; border-top:1px solid #eee; margin:14px 0;">

  <p><strong>⚠️ Importante:</strong> a sessão só estará confirmada mediante o envio de um
    <strong>sinal de 25% do valor</strong>, que será descontado do total no dia da sessão.</p>

  <p><strong>Por favor responda a este e-mail confirmando o recebimento</strong> —
    isso nos ajuda a garantir que você recebeu todas as instruções.
    Lembre-se: a data só será definitivamente reservada após o envio do sinal.
  </p>

  <p>Para maior agilidade, envie mensagem solicitando a chave pix pelo <a href="https://ig.me/m/foraisso" target="_blank">Instagram</a> ou pelo <a href="https://wa.me/5511984799777" target="_blank">WhatsApp</a>
  </p>

  <hr style="border:none; border-top:1px solid #eee; margin:14px 0;">

  <h3>Aqui está um resumo das suas respostas:</h3>
  ${responsesHtml}

  <p style="font-size:13px; color:#666; margin-top: 20px;">
    Caso tenha alguma dúvida ou necessidade específica, por favor a encaminhe na resposta ou nos chame no WhatsApp, assim ajustaremos a sessão para você.
  </p>
</div>
  `.trim()
}

function getAdminEmailHtml(payload: FiattPayload, isNewPerson: boolean, responsesHtml: string): string {
  return `
<div style="font-family:Arial, sans-serif; font-size: 14px; color:#111; line-height:1.45; max-width:600px;">
  <h3>Um novo formulário foi preenchido por ${escapeHtml(payload.full_name)}!</h3>
  <p><strong>E-mail:</strong> ${escapeHtml(payload.email)}<br/>
  <strong>WhatsApp:</strong> ${escapeHtml(payload.whatsapp)}<br/>
  <strong>Pseudônimo:</strong> ${escapeHtml(payload.pseudonym || '-')}<br/>
  <strong>Pronomes:</strong> ${escapeHtml(payload.pronouns || '-')}<br/>
  <strong>Idade:</strong> ${escapeHtml(payload.age)}<br/>
  <strong>Redes sociais:</strong> ${escapeHtml(payload.social_media)}<br/>
  <strong>Cadastro:</strong> ${isNewPerson ? 'nova pessoa criada' : 'vinculado a pessoa existente (dados cadastrais não alterados)'}</p>
  <hr/>
  <p>Detalhes abaixo:</p>
  ${responsesHtml}
</div>
  `.trim()
}

async function sendEmail(
  apiKey: string,
  message: { from: string; to: string[]; subject: string; html: string; reply_to?: string }
): Promise<boolean> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    })
    if (!response.ok) {
      console.error('[fiatt] Resend error:', response.status, await response.text())
      return false
    }
    return true
  } catch (error) {
    console.error('[fiatt] Resend exception:', error)
    return false
  }
}

// ── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  const requestOrigin = req.headers.get('origin')
  const corsHeaders = buildCorsHeaders(requestOrigin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, corsHeaders)
  }

  if (!requestOrigin || !ALLOWED_ORIGINS.includes(requestOrigin)) {
    return jsonResponse({ error: 'Origin not allowed' }, 403, corsHeaders)
  }

  if (!req.headers.get('content-type')?.includes('application/json')) {
    return jsonResponse({ error: 'Unsupported media type' }, 415, corsHeaders)
  }

  try {
    const rawBody = await req.text()
    if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) {
      return jsonResponse({ error: 'Payload too large' }, 413, corsHeaders)
    }

    let rawPayload: unknown
    try {
      rawPayload = JSON.parse(rawBody)
    } catch {
      return jsonResponse({ error: 'Invalid JSON' }, 400, corsHeaders)
    }

    // Honeypot: bots fill hidden fields. Pretend success, store nothing.
    if (
      rawPayload &&
      typeof rawPayload === 'object' &&
      typeof (rawPayload as Record<string, unknown>).website === 'string' &&
      ((rawPayload as Record<string, unknown>).website as string).length > 0
    ) {
      console.warn('[fiatt] Honeypot triggered')
      return jsonResponse({ success: true }, 200, corsHeaders)
    }

    const clientIp = getClientIp(req)

    const turnstileToken =
      rawPayload && typeof rawPayload === 'object'
        ? (rawPayload as Record<string, unknown>).turnstileToken
        : undefined
    const turnstileValid = await verifyTurnstileToken(
      typeof turnstileToken === 'string' ? turnstileToken : '',
      Deno.env.get('TURNSTILE_SECRET') ?? '',
      clientIp
    )
    if (!turnstileValid) {
      return jsonResponse(
        { error: 'Verificação de segurança falhou. Tente novamente.' },
        403,
        corsHeaders
      )
    }

    const parsed = payloadSchema.safeParse(rawPayload)
    if (!parsed.success) {
      const invalidFields = [
        ...new Set(parsed.error.issues.map(issue => String(issue.path[0] ?? 'payload')))
      ]
      return jsonResponse({ error: 'Dados inválidos', fields: invalidFields }, 400, corsHeaders)
    }
    const payload = parsed.data

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured')
    }
    // Service role bypasses RLS — safe because every column is explicitly mapped.
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // ── Rate limit by IP ──────────────────────────────────────────────────
    const ipHash = await hashIp(clientIp)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count: ipCount, error: ipCountError } = await supabase
      .from('fiatt_client_records')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', oneHourAgo)
    if (ipCountError) throw new Error(`Rate limit query failed: ${ipCountError.message}`)
    if ((ipCount ?? 0) >= RATE_LIMIT_PER_IP_PER_HOUR) {
      return jsonResponse(
        { error: 'Muitas solicitações. Tente novamente mais tarde.' },
        429,
        corsHeaders
      )
    }

    // ── Person lookup (never overwrite existing people data) ──────────────
    const { data: existingPerson, error: lookupError } = await supabase
      .from('people')
      .select('id, is_client')
      .ilike('email', escapeLikePattern(payload.email))
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (lookupError) throw new Error(`Person lookup failed: ${lookupError.message}`)

    let personId: string
    const isNewPerson = !existingPerson

    if (existingPerson) {
      personId = existingPerson.id

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { count: personCount, error: personCountError } = await supabase
        .from('fiatt_client_records')
        .select('id', { count: 'exact', head: true })
        .eq('person_id', personId)
        .gte('created_at', oneDayAgo)
      if (personCountError) {
        throw new Error(`Rate limit query failed: ${personCountError.message}`)
      }
      if ((personCount ?? 0) >= RATE_LIMIT_PER_PERSON_PER_DAY) {
        return jsonResponse(
          { error: 'Muitas solicitações. Tente novamente mais tarde.' },
          429,
          corsHeaders
        )
      }

      if (!existingPerson.is_client) {
        const { error: flagError } = await supabase
          .from('people')
          .update({ is_client: true })
          .eq('id', personId)
        if (flagError) console.error('[fiatt] is_client update failed:', flagError.message)
      }
    } else {
      const { data: newPerson, error: personError } = await supabase
        .from('people')
        .insert({
          full_name: payload.full_name,
          email: payload.email,
          phone: payload.whatsapp,
          is_client: true
        })
        .select('id')
        .single()
      if (personError) throw new Error(`Person insert failed: ${personError.message}`)
      personId = newPerson.id
    }

    // ── Record insert ─────────────────────────────────────────────────────
    const record = buildRecord(payload, personId, ipHash)
    const { error: recordError } = await supabase.from('fiatt_client_records').insert(record)
    if (recordError) throw new Error(`Record insert failed: ${recordError.message}`)

    // ── Emails (record is already saved; failures here don't fail the request)
    let emailSent = false
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('[fiatt] RESEND_API_KEY not configured')
    } else {
      const fromEmail =
        Deno.env.get('RESEND_FROM_EMAIL') || 'foraisso <noreply@auth.zerino.org>'
      const responsesHtml = formatResponses(record)
      const [adminSent, clientSent] = await Promise.all([
        sendEmail(resendApiKey, {
          from: fromEmail,
          to: [ADMIN_EMAIL],
          reply_to: payload.email,
          subject: `Sessão ${payload.form_type}: ${payload.full_name.replace(/[\r\n]+/g, ' ')}`,
          html: getAdminEmailHtml(payload, isNewPerson, responsesHtml)
        }),
        sendEmail(resendApiKey, {
          from: fromEmail,
          to: [payload.email],
          subject: 'Sua requisição de sessão foi enviada ao foraisso',
          html: getClientEmailHtml(payload.full_name, payload.form_type, responsesHtml)
        })
      ])
      emailSent = adminSent && clientSent
    }

    return jsonResponse({ success: true, emailSent }, 200, corsHeaders)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[fiatt-session-emails] error:', message)
    // Generic message: never leak database/internal details to the client.
    return jsonResponse(
      { error: 'Não foi possível enviar o formulário. Tente novamente mais tarde.' },
      500,
      corsHeaders
    )
  }
})
