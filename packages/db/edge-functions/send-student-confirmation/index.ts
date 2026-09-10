// Supabase Edge Function — send-student-confirmation
// Runtime: Deno (Supabase Edge Functions)
//
// Deployment:
//   supabase functions deploy send-student-confirmation
//   supabase secrets set RESEND_API_KEY=<your-resend-key>
//   supabase secrets set RESEND_FROM_EMAIL="FIALN <aulas@seudominio.com>" (opcional)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type'
}

interface ConfirmationPayload {
  email: string
  first_name?: string
  full_name: string
  phone?: string
  course_title?: string | null
  schedule_day?: string | null
  shibari_experience?: string | null
  shibari_goals?: string | null
  confirmation_token: string
  app_url?: string
}

function generateEmailHtml(
  payload: ConfirmationPayload,
  confirmationUrl: string
): string {
  const greetingName =
    payload.first_name || payload.full_name.split(' ')[0] || 'Aluno(a)'
  const courseInfo = payload.course_title
    ? `${payload.course_title}${payload.schedule_day ? ` (${payload.schedule_day})` : ''}`
    : 'A combinar / Aulas particulares'
  const experienceInfo = payload.shibari_experience
    ? payload.shibari_experience.replace(/\n/g, '<br/>')
    : 'Não informada'
  const goalsInfo = payload.shibari_goals
    ? payload.shibari_goals.replace(/\n/g, '<br/>')
    : 'Não informados'

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação de Pré-Matrícula — FIALN</title>
</head>
<body style="margin: 0; padding: 0; background-color: #121316; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e4e4e7;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 40px 15px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #1a1b20; border: 1px solid #2e3039; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 20px; text-align: center; border-bottom: 1px solid #2e3039;">
              <div style="font-size: 40px; line-height: 1; margin-bottom: 10px;">🎋</div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #f4f4f5; letter-spacing: 0.5px;">FIALN</h1>
              <p style="margin: 6px 0 0; font-size: 14px; color: #a1a1aa;">Confirmação de Pré-Matrícula & Revisão de Cadastro</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #f4f4f5;">
                Olá, <strong>${greetingName}</strong>!
              </p>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #d4d4d8;">
                Recebemos o seu formulário de inscrição. Para garantir a segurança dos seus dados e dar sequência à sua participação, confira abaixo o resumo das informações preenchidas:
              </p>

              <!-- Summary Card -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #23252c; border: 1px solid #32353e; border-radius: 8px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #2e3039;">
                    <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #a1a1aa; margin-bottom: 2px;">Nome Completo</span>
                    <span style="font-size: 14px; font-weight: 600; color: #fafafa;">${payload.full_name}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #2e3039;">
                    <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #a1a1aa; margin-bottom: 2px;">E-mail</span>
                    <span style="font-size: 14px; font-weight: 600; color: #fafafa;">${payload.email}</span>
                  </td>
                </tr>
                ${
                  payload.phone
                    ? `
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #2e3039;">
                    <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #a1a1aa; margin-bottom: 2px;">WhatsApp</span>
                    <span style="font-size: 14px; font-weight: 600; color: #fafafa;">${payload.phone}</span>
                  </td>
                </tr>
                `
                    : ''
                }
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #2e3039;">
                    <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #a1a1aa; margin-bottom: 2px;">Curso / Dia de Preferência</span>
                    <span style="font-size: 14px; font-weight: 600; color: #e0a96d;">${courseInfo}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #2e3039;">
                    <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #a1a1aa; margin-bottom: 4px;">Experiência Prévia</span>
                    <div style="font-size: 13px; line-height: 1.5; color: #d4d4d8;">${experienceInfo}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px;">
                    <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #a1a1aa; margin-bottom: 4px;">Objetivos no Shibari</span>
                    <div style="font-size: 13px; line-height: 1.5; color: #d4d4d8;">${goalsInfo}</div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0 20px;">
                <a href="${confirmationUrl}" target="_blank" style="display: inline-block; background: #e0a96d; color: #18181b; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 6px; box-shadow: 0 2px 8px rgba(224, 169, 109, 0.3);">
                  ✓ Confirmar Minha Pré-Matrícula
                </a>
              </div>

              <p style="margin: 0; font-size: 12px; line-height: 1.5; text-align: center; color: #71717a;">
                Ou copie e cole o link a seguir no seu navegador:<br/>
                <a href="${confirmationUrl}" style="color: #e0a96d; word-break: break-all;">${confirmationUrl}</a>
              </p>

              <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #2e3039; font-size: 12px; color: #71717a; line-height: 1.5;">
                <p style="margin: 0 0 6px;">⏱ <em>Este link é seguro e válido por 72 horas.</em></p>
                <p style="margin: 0;">Se você não solicitou este cadastro, pode desconsiderar esta mensagem.</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #15161a; text-align: center; border-top: 1px solid #2e3039;">
              <p style="margin: 0; font-size: 12px; color: #71717a;">
                FIALN — Gestão & Pedagogia de Shibari
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
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
    const payload: ConfirmationPayload = await req.json()

    if (!payload.email || !payload.full_name || !payload.confirmation_token) {
      return new Response(
        JSON.stringify({
          error: 'email, full_name and confirmation_token are required'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
      console.error('[send-student-confirmation] RESEND_API_KEY secret not set')
      return new Response(
        JSON.stringify({
          error: 'RESEND_API_KEY secret not configured on server'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Default sender (allows onboarding@resend.dev for test/sandbox or custom domain)
    const fromEmail =
      Deno.env.get('RESEND_FROM_EMAIL') || 'foraisso <noreply@auth.zerino.org>'

    // Base URL for hash routing in FIALN
    const baseUrl =
      payload.app_url || Deno.env.get('APP_URL') || 'https://fialn.netlify.app'
    const cleanBaseUrl = baseUrl.replace(/\/+$/, '')
    const confirmationUrl = `${cleanBaseUrl}/#confirmar-cadastro?token=${payload.confirmation_token}`

    const htmlContent = generateEmailHtml(payload, confirmationUrl)

    // Call Resend API via fetch
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [payload.email],
        subject: 'Confirmação de Pré-Matrícula — FIALN',
        html: htmlContent
      })
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      console.error('[send-student-confirmation] Resend API error:', resendData)
      return new Response(
        JSON.stringify({
          error: 'Failed to send email via Resend',
          details: resendData
        }),
        {
          status: resendResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true, resendId: resendData.id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[send-student-confirmation] error:', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
