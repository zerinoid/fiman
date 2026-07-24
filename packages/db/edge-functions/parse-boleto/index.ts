// Supabase Edge Function — parse-boleto
// Runtime: Deno (Supabase Edge Functions)
//
// Deployment:
//   supabase functions deploy parse-boleto --project-ref ggroffvtxptgxyzrvmdi
//   supabase secrets set GEMINI_API_KEY=<your-key> --project-ref ggroffvtxptgxyzrvmdi
//
// The function accepts multipart/form-data with a 'file' field (PDF or image).
// It calls Gemini 2.0 Flash with structured output to extract 3 boleto fields,
// then returns JSON to the frontend.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Gemini structured output schema for the boleto fields
const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    rent_amount:             { type: 'number', description: 'Valor do Aluguel (campo "Aluguel" no boleto)' },
    condo_measured:          { type: 'number', description: 'Condomínio medido — campo "med. condominio"' },
    condo_credit_prev_month: { type: 'number', description: 'Crédito do condomínio do mês passado — campo "cred. cond. mes passado". Geralmente negativo.' },
    total_payable:           { type: 'number', description: 'Soma total a pagar = rent_amount + condo_measured + condo_credit_prev_month' },
  },
  required: ['rent_amount', 'condo_measured', 'condo_credit_prev_month', 'total_payable'],
};

const EXTRACTION_PROMPT = `
Você é um extrator preciso de dados de boletos de aluguel residencial brasileiros.

Analise o documento e extraia EXATAMENTE os seguintes campos:
1. **rent_amount**: valor do campo "Aluguel" (aluguel base, sem condomínio)
2. **condo_measured**: valor do campo "med. condominio" ou "condomínio medido"
3. **condo_credit_prev_month**: valor do campo "cred. cond. mes passado" (crédito de antena/terraço — normalmente um valor NEGATIVO)
4. **total_payable**: soma total = rent_amount + condo_measured + condo_credit_prev_month

Use os valores numéricos exatos (ponto como separador decimal).
Se um campo não existir no documento, use 0.
`.trim();

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // ── 1. Parse multipart form data ──────────────────────────────────
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided in form data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const mimeType = file.type || 'application/pdf';
    const maxBytes = 20 * 1024 * 1024; // 20 MB inline data limit

    if (file.size > maxBytes) {
      return new Response(JSON.stringify({ error: 'File too large (max 20 MB)' }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── 2. Convert file to base64 ─────────────────────────────────────
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array  = new Uint8Array(arrayBuffer);

    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64Data = btoa(binary);

    // ── 3. Call Gemini 2.0 Flash with structured output ───────────────
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY secret not set' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const geminiBody = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            { text: EXTRACTION_PROMPT },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema:   RESPONSE_SCHEMA,
        temperature:      0,
      },
    };

    const geminiResponse = await fetch(geminiUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(geminiBody),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error('Gemini API error:', errText);
      return new Response(
        JSON.stringify({ error: `Gemini API error: ${geminiResponse.status}`, detail: errText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const geminiData = await geminiResponse.json();

    // ── 4. Extract the structured result ─────────────────────────────
    const rawText: string = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    const result = JSON.parse(rawText) as {
      rent_amount: number;
      condo_measured: number;
      condo_credit_prev_month: number;
      total_payable: number;
    };

    // Validate required fields
    if (
      typeof result.rent_amount !== 'number' ||
      typeof result.condo_measured !== 'number' ||
      typeof result.condo_credit_prev_month !== 'number'
    ) {
      throw new Error('Gemini returned unexpected structure');
    }

    // Recalculate total_payable server-side to be safe
    result.total_payable = result.rent_amount + result.condo_measured + result.condo_credit_prev_month;

    // ── 5. (Optional) Persist to DB with service-role client ─────────
    // The frontend handles the final DB save after user confirmation,
    // but we log the raw OCR here for auditing if desired.
    const SUPABASE_URL             = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await admin.from('fiorc_rent_boletos').insert({
        month_year:               new Date().toISOString().slice(0, 7) + '-01',
        rent_amount:              result.rent_amount,
        condo_measured:           result.condo_measured,
        condo_credit_prev_month:  result.condo_credit_prev_month,
        total_payable:            result.total_payable,
        raw_ocr_json:             geminiData,
      }).single();
      // Ignore insert errors — parsing still succeeds
    }

    return new Response(JSON.stringify(result), {
      status:  200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('parse-boleto error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status:  500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
