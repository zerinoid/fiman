import { createClient } from 'jsr:@supabase/supabase-js@2'

// Configurações de CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

const FIELD_LABELS: Record<string, string> = {
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
  risk_blindfold: 'Risco: Venda nos olhos',
  risk_hair_pulling: 'Risco: Puxar cabelo',
  risk_breath_play: 'Risco: Jogos de respiração',
  risk_neck_rope: 'Risco: Corda no pescoço',
  risk_rope_gag: 'Risco: Mordaça',
  risk_matanawa: 'Risco: Matanawa',
  risk_nipple_rope: 'Risco: Corda nos mamilos',
  risk_toe_rope: 'Risco: Corda no dedão do pé',
  medical_conditions_overview: 'Visão geral médica',
  has_diabetes: 'Diabetes?',
  has_blood_pressure_issues: 'Problemas de pressão?',
  has_asthma: 'Asma?',
  has_epilepsy: 'Epilepsia?',
  has_osteopenia: 'Osteopenia/Osteoporose',
  has_hemophilia: 'Hemofilia?',
  has_peripheral_neuropathy: 'Neuropatia Periférica?',
  has_joint_subluxation: 'Luxação/Subluxação?',
  has_prosthesis: 'Prótese?',
  has_stroke_history: 'Histórico de AVC?',
  has_hernia: 'Hérnia/Compressão',
  movement_restrictions: 'Restrições de movimento',
  neurodivergence: 'Neurodivergência',
  continuous_medication: 'Medicação contínua',
  surgery_or_injury: 'Cirurgias/Lesões',
  allergies: 'Alergias',
  safeword: 'Palavra de Segurança',
  stop_signal: 'Sinal de parada',
  authorizes_media: 'Autoriza registros?',
  authorizes_social_media: 'Autoriza redes sociais?',
  hidden_body_parts: 'Partes do corpo a ocultar',
  session_expectations: 'Expectativas da sessão',
  frequency_expectations: 'Expectativa de frequência',
  additional_info: 'Informações adicionais',
  declaration_truth: 'Declaração de veracidade'
}

function formatResponses(record: Record<string, any>): string {
  let html = ''
  for (const [key, value] of Object.entries(record)) {
    // Ignorar campos de sistema e campos pessoais base (que não vão no resumo da sessão)
    if (['id', 'person_id', 'created_at', 'full_name', 'email', 'whatsapp', 'pseudonym', 'age', 'pronouns', 'social_media'].includes(key)) continue
    
    // Ignorar nulos ou strings vazias
    if (value === null || value === undefined || value === '') continue

    const label = FIELD_LABELS[key] || key
    let displayValue = value
    if (typeof value === 'boolean') {
      displayValue = value ? 'Sim' : 'Não'
    }

    html += `
      <p style="margin-bottom: 8px;">${label}:<br/>
      <span style="font-size:1.1em; font-weight: bold; color:#333;">${displayValue}</span></p>
    `
  }
  return html
}

function getClientEmailHtml(nome: string, formType: string, respostasHtml: string): string {
  const tipoFormatado = formType === 'fotografica' ? 'fotográfica' : 'privada'
  return `
<div style="font-family:Arial, sans-serif; font-size: 14px; color:#111; line-height:1.45; max-width:600px;">
  <h1>Obrigado por preencher o formulário de sessão ${tipoFormatado}!</h1>
  <p>Leia atentamente os itens deste e-mail para confirmar sua sessão!</p>

  <h3>✨ Preparação para sua sessão de Shibari</h3>

  <p>Olá ${nome},</p>

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
  ${respostasHtml}

  <p style="font-size:13px; color:#666; margin-top: 20px;">
    Caso tenha alguma dúvida ou necessidade específica, por favor a encaminhe na resposta ou nos chame no WhatsApp, assim ajustaremos a sessão para você.
  </p>
</div>
  `.trim()
}

function getAdminEmailHtml(nome: string, payload: any, respostasHtml: string): string {
  return `
<div style="font-family:Arial, sans-serif; font-size: 14px; color:#111; line-height:1.45; max-width:600px;">
  <h3>Um novo formulário foi preenchido por ${nome}!</h3>
  <p><strong>E-mail:</strong> ${payload.email}<br/>
  <strong>WhatsApp:</strong> ${payload.whatsapp || 'Não informado'}<br/>
  <strong>Pronomes:</strong> ${payload.pronouns || '-'}<br/>
  <strong>Idade:</strong> ${payload.age || '-'}</p>
  <hr/>
  <p>Detalhes abaixo:</p>
  ${respostasHtml}
</div>
  `.trim()
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const payload = await req.json()

    if (!payload.email || !payload.full_name) {
      return new Response(JSON.stringify({ error: 'O email e o full_name são obrigatórios' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados')
    }

    // Usamos a SERVICE_ROLE_KEY para contornar o RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const emailNorm = payload.email.toLowerCase().trim()
    let personId = null

    // 1. Verificar se a pessoa já existe
    const { data: existingPerson } = await supabase
      .from('people')
      .select('id')
      .eq('email', emailNorm)
      .single()

    if (existingPerson) {
      personId = existingPerson.id
      // Atualizar dados cadastrais básicos da pessoa existente
      await supabase.from('people').update({
        full_name: payload.full_name,
        phone: payload.whatsapp,
        is_client: true
      }).eq('id', personId)
    } else {
      // Inserir nova pessoa na tabela mestre people
      const { data: newPerson, error: personErr } = await supabase
        .from('people')
        .insert({
          full_name: payload.full_name,
          email: emailNorm,
          phone: payload.whatsapp,
          is_client: true
        })
        .select('id')
        .single()

      if (personErr) throw new Error(`Erro ao criar pessoa: ${personErr.message}`)
      personId = newPerson.id
    }

    // 2. Montar dados para fiatt_client_records omitindo dados pessoais base que já foram pra people
    const { 
      full_name, email, whatsapp, // Extraídos
      ...recordData // Restante vai para a ficha
    } = payload;
    
    recordData.person_id = personId;

    const { error: recordErr } = await supabase
      .from('fiatt_client_records')
      .insert(recordData)

    if (recordErr) throw new Error(`Erro ao criar ficha: ${recordErr.message}`)

    // 3. Preparar e Enviar E-mails
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY não configurada no servidor')

    const adminEmail = 'leo.zerino@gmail.com'
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'foraisso <noreply@auth.zerino.org>'
    const formType = payload.form_type || 'privada'

    const respostasHtml = formatResponses(recordData)
    const clientHtml = getClientEmailHtml(payload.full_name, formType, respostasHtml)
    const adminHtml = getAdminEmailHtml(payload.full_name, payload, respostasHtml)

    // Enviar para o Admin
    const resendAdminReq = fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [adminEmail],
        subject: `Sessão ${formType}: ${payload.full_name}`,
        html: adminHtml
      })
    })

    // Enviar para o Cliente
    const resendClientReq = fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [emailNorm],
        subject: 'Sua requisição de sessão foi enviada ao foraisso',
        html: clientHtml
      })
    })

    const [adminRes, clientRes] = await Promise.all([resendAdminReq, resendClientReq])

    if (!adminRes.ok || !clientRes.ok) {
      console.error('[fiatt-session-emails] Resend error', await adminRes.text(), await clientRes.text())
      throw new Error('Falha no envio de e-mail')
    }

    return new Response(JSON.stringify({ success: true, message: 'Ficha recebida e emails enviados com sucesso' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[fiatt-session-emails] error:', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
