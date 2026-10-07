import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Instancie o cliente Supabase com a URL e Service Role Key
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importData() {
  console.log('Iniciando importação de dados...');

  const files = [
    { type: 'privada', path: path.join(__dirname, 'privada.csv') },
    { type: 'fotografica', path: path.join(__dirname, 'fotografica.csv') }
  ];

  for (const file of files) {
    if (!fs.existsSync(file.path)) {
      console.warn(`Arquivo ${file.path} não encontrado, pulando...`);
      continue;
    }

    const csvData = fs.readFileSync(file.path, 'utf8');
    const parsed = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true
    });

    for (const row of parsed.data) {
      const email = row['E-mail'] || row['E-mail']?.toLowerCase().trim();
      let personId = null;

      if (email) {
        const { data: existingPerson } = await supabase
          .from('people')
          .select('id')
          .eq('email', email)
          .single();

        if (existingPerson) {
          personId = existingPerson.id;
        }
      }

      if (!personId) {
        // Insere nova pessoa na tabela people (mantendo apenas dados core)
        const { data: newPerson, error: personErr } = await supabase
          .from('people')
          .insert({
            full_name: row['Nome completo'] || 'Sem Nome',
            email: email,
            phone: row['Whatsapp'] || row['WhatsApp'],
            is_client: true,
            created_at: row['Timestamp'] ? new Date(row['Timestamp']).toISOString() : new Date().toISOString()
          })
          .select('id')
          .single();

        if (personErr) {
          console.error('Erro ao inserir cliente em people:', personErr);
          continue;
        }
        personId = newPerson.id;
      }

      // 2. Montar dados do formulário (agora vão para fiatt_client_records)
      const formDate = row['Timestamp'] ? new Date(row['Timestamp']) : new Date();
      
      const recordData = {
        person_id: personId,
        form_type: file.type,
        created_at: formDate.toISOString(),

        pseudonym: row['Pseudonimo'],
        age: parseInt(row['Idade'], 10) || null,
        pronouns: row['Pronomes'],
        social_media: row['Redes sociais (rede: @)'],

        desired_date: row['Tem alguma data em mente para a realização da sessão?'],
        body_modification_planned: row['Pretende fazer algum modificação corporal entre hoje e essa data? (Tatuagem, escarificação, preenchimento, piercing, etc)'] === 'Sim',
        body_modification_details: row['Caso afirmativo, descreva a modificação e informe a data em que agendou o procedimento'],

        identifies_as: row['Caso se aplique, com qual posição se identifica mais?'] || null,
        session_intensity: row['Qual intensidade de sessão você gostaria (suave, com muita restrição, desconforto, dor)?'] || row['Qual intensidade nas figuras corporais você gostaria?'],
        shibari_experience: row['Você já teve experiências no Shibari? Se sim, descreva brevemente.'],
        pain_relation: row['Qual relação você tem com a dor'] || row['Qual sua sensibilidade para dor?'],
        emotional_limits: row['Existem limites emocionais ou psicológicos que devemos levar em consideração?'],
        activities_not_desired: row['Existem atividades, situações ou sensações específicas que você definitivamente NÃO deseja experimentar?'] || null,
        shibari_motivation: row['O que te fez procurar a mim, especificamente, para realizar uma sessão de Shibari?'],
        desired_activities_positions: row['Existe alguma atividade, sensação ou posição específica que você gostaria de explorar?'] || row['Existe alguma amarração ou posição específica que você gostaria de explorar?'],
        fetishes_non_conventional: row['Existe algum fetiche ou elemento não convencional que você deseje incorporar à sessão?'] || null,
        can_hang_upside_down: row['Consegue ficar de ponta cabeça?'] === 'Sim',

        // Saúde
        medical_conditions_overview: row['Você possui alguma condição médica relevante que eu deva estar ciente? (Hipertensão, doença cardiovascular, varize, trombose, asma, doença pulmonar crônica, epilepsia, neuropatia periférica, artrite, lesão recente, osteopenia, osteoporose, síndrome de Raynaud, linfedema, eczema, psoríase (ou outra condição de pele), alergia à juta, ansiedade / ataque de pânico, TEPT (ou histórico de trauma  por restrições físicas), diabetes, hipoglicemia ou hemofilia)'],
        has_diabetes: row['Diabetes?'] === 'Sim',
        has_blood_pressure_issues: row['Hipotensão (pressão baixa) ou Hipertensão (pressão alta)?'] === 'Sim',
        has_asthma: row['Asma?'] === 'Sim',
        has_epilepsy: row['Epilepsia?'] === 'Sim',
        has_osteopenia: row['Osteopenia ou Osteoporose? Se sim, em que parte do corpo?'],
        has_hemophilia: row['Hemofilia?'] === 'Sim',
        has_peripheral_neuropathy: row['Neuropatia Periférica (artrite, lesões, desensibilização por diabetes)'] === 'Sim',
        has_joint_subluxation: row['Histórico de luxação ou subluxação articular'] === 'Sim',
        has_prosthesis: row['Portador de prótese?'] === 'Sim',
        has_stroke_history: row['Já teve AVC?'] === 'Sim',
        has_hernia: row['Diagnóstico de hérnia, abaulamento ou compressão medular? Se sim, em que nível da coluna'],
        movement_restrictions: row['Existe alguma postura ou movimento que você não consiga ficar/fazer? Se sim, qual o motivo?'],
        neurodivergence: row['Possui quadro de neurodivergência? (Em caso positivo descrever especificidades / nível de suporte, etc.)'],
        continuous_medication: row['Você toma algum medicamento de uso contínuo?'],
        surgery_or_injury: row['Você já passou por alguma cirurgia ou teve alguma lesão?'],
        allergies: row['Você tem alguma alergia conhecida? (juta, óleos, pelos de gato)'],

        // Resultados
        safeword: row['Você tem uma palavra de segurança que deseja utilizar durante nossas sessões?'] || null,
        stop_signal: row['Existe algum sinal ou gesto específico que você usa para indicar\ndesconforto ou necessidade de parar?'] || row['Existe algum sinal ou gesto específico que você usa para indicar desconforto ou necessidade de parar?'],
        authorizes_media: row['Você autoriza/deseja que sejam registradas fotos e vídeos da sessão?'] || null,
        authorizes_social_media: row['Você autoriza a divulgação de imagens/vídeos nas minhas páginas de redes sociais, para fins de documentação e divulgação?'] || row['Você autoriza que o material seja divulgado, com os devidos créditos e marcações nas minhas páginas de redes sociais também?'],
        hidden_body_parts: row['No caso positivo para registro e divulgação de mídias, há alguma parte do corpo ou rosto que gostaria de ocultar?'] || null,
        session_expectations: row['O que você espera obter dessa sessão de Shibari?'] || null,
        frequency_expectations: row['Quais são suas expectativas em termos de frequência de sessões?'] || null,
        additional_info: row['Existe alguma informação adicional que você considera importante compartilhar?'],
        declaration_truth: row['Declaro que as informações aqui fornecidas são verdadeiras e que sou responsável pelo que foi declarado e por qualquer omissão ou informação incorreta.']
      };

      const { error: recordErr } = await supabase
        .from('fiatt_client_records')
        .insert(recordData);

      if (recordErr) {
        console.error('Erro ao inserir formulário em client_records:', recordErr, row);
      } else {
        console.log(`Formulário importado para ${email}`);
      }
    }
  }

  console.log('Importação concluída.');
}

importData().catch(console.error);
