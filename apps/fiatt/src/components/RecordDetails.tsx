import React from 'react';
import { FiattClientRecord } from '../hooks/useFiattRecords';

export function RecordDetails({ record }: { record: FiattClientRecord }) {
  const p = record.people;

  const Block = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div style={{ marginBottom: '1.5rem', background: 'var(--fi-color-surface-2)', padding: '1rem', borderRadius: '8px' }}>
      <h4 style={{ margin: '0 0 1rem', color: 'var(--fi-color-primary)', borderBottom: '1px solid var(--fi-color-border)', paddingBottom: '0.5rem' }}>{title}</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>{children}</div>
    </div>
  );

  const Field = ({ label, value }: { label: string, value: string | boolean | null | undefined }) => {
    if (value === null || value === undefined || value === '' || value === false) return null;
    const display = value === true ? 'Sim' : value;
    return (
      <div>
        <div style={{ fontSize: '0.8rem', color: 'var(--fi-color-text-muted)', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{display}</div>
      </div>
    );
  };

  return (
    <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '1rem' }}>
      <Block title="Dados Pessoais">
        <Field label="Nome Completo" value={p?.full_name} />
        <Field label="Pseudônimo" value={p?.pseudonym} />
        <Field label="Idade" value={p?.age ? String(p.age) : null} />
        <Field label="Pronomes" value={p?.pronouns} />
        <Field label="E-mail" value={p?.email} />
        <Field label="WhatsApp" value={p?.phone} />
        <Field label="Redes Sociais" value={p?.social_media} />
        <Field label="Data Desejada" value={record.desired_date} />
      </Block>

      <Block title="Experiências & Desejos">
        <Field label="Identifica-se como" value={record.identifies_as} />
        <Field label="Experiência em Shibari" value={record.shibari_experience} />
        <Field label="Intensidade desejada" value={record.session_intensity} />
        <Field label="Relação com a dor" value={record.pain_relation} />
        <Field label="Motivação" value={record.shibari_motivation} />
        <Field label="Limites Emocionais" value={record.emotional_limits} />
        <Field label="Atividades indesejadas" value={record.activities_not_desired} />
        <Field label="Atividades desejadas" value={record.desired_activities_positions} />
        <Field label="Fetiches" value={record.fetishes_non_conventional} />
        <Field label="Consegue ficar de ponta cabeça?" value={record.can_hang_upside_down} />
      </Block>

      <Block title="Perfil de Risco (Limites)">
        <Field label="Venda nos olhos" value={record.risk_blindfold} />
        <Field label="Puxar cabelo" value={record.risk_hair_pulling} />
        <Field label="Jogos de respiração" value={record.risk_breath_play} />
        <Field label="Corda no pescoço" value={record.risk_neck_rope} />
        <Field label="Mordaça" value={record.risk_rope_gag} />
        <Field label="Matanawa" value={record.risk_matanawa} />
        <Field label="Corda nos mamilos" value={record.risk_nipple_rope} />
        <Field label="Corda no dedão do pé" value={record.risk_toe_rope} />
      </Block>

      <Block title="Saúde & Segurança">
        <Field label="Visão Geral Médica" value={record.medical_conditions_overview} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
          <Field label="Diabetes" value={record.has_diabetes} />
          <Field label="Pressão" value={record.has_blood_pressure_issues} />
          <Field label="Asma" value={record.has_asthma} />
          <Field label="Epilepsia" value={record.has_epilepsy} />
          <Field label="Hemofilia" value={record.has_hemophilia} />
          <Field label="Neuropatia" value={record.has_peripheral_neuropathy} />
          <Field label="Luxação" value={record.has_joint_subluxation} />
          <Field label="Prótese" value={record.has_prosthesis} />
          <Field label="AVC" value={record.has_stroke_history} />
        </div>
        <Field label="Osteopenia" value={record.has_osteopenia} />
        <Field label="Hérnia/Abaulamento" value={record.has_hernia} />
        <Field label="Restrições de Movimento" value={record.movement_restrictions} />
        <Field label="Neurodivergência" value={record.neurodivergence} />
        <Field label="Medicação Contínua" value={record.continuous_medication} />
        <Field label="Cirurgia/Lesão" value={record.surgery_or_injury} />
        <Field label="Alergias" value={record.allergies} />
        <Field label="Modificação Corporal Planejada?" value={record.body_modification_planned} />
        <Field label="Detalhes Modificação" value={record.body_modification_details} />
      </Block>

      <Block title="Resultados & Expectativas">
        <Field label="Expectativas da Sessão" value={record.session_expectations} />
        <Field label="Palavra de Segurança" value={record.safeword} />
        <Field label="Sinal de Parada" value={record.stop_signal} />
        <Field label="Autoriza Mídia" value={record.authorizes_media} />
        <Field label="Autoriza Redes Sociais" value={record.authorizes_social_media} />
        <Field label="Ocultar Partes" value={record.hidden_body_parts} />
        <Field label="Expectativa de Frequência" value={record.frequency_expectations} />
        <Field label="Info Adicional" value={record.additional_info} />
      </Block>
    </div>
  );
}
