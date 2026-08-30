import { useState } from 'react';
import { supabase } from '../lib/supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

// ---------------------------------------------------------------------------
// Consent term text — kept as a constant to make future edits easy
// ---------------------------------------------------------------------------

const CONSENT_PARAGRAPHS = [
  'Afirmo que todas as informações prestadas neste formulário são verdadeiras e completas.',
  'Entendo que minha experiência prévia em Shibari é informação determinante para que o facilitador possa oferecer a melhor orientação pedagógica possível.',
  'Estou ciente de que, salvo comunicação prévia e explícita do facilitador, devo comparecer às aulas acompanhado(a) de um(a) modelo.',
  'Confirmo que dediquei tempo para ler e estudar os fundamentos básicos de segurança em Shibari antes de iniciar as aulas, compreendendo que a segurança é responsabilidade compartilhada entre praticantes.',
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PublicRegistrationPage() {
  // --- Form state ---
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [shibariExperience, setShibariExperience] = useState('');
  const [shibariGoals, setShibariGoals] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);

  // --- Submission state ---
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isSubmitting = submitState === 'submitting';

  // --- Submit handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setErrorMessage(null);

    if (!fullName.trim()) {
      setValidationError('O nome completo é obrigatório.');
      return;
    }
    if (!consentAccepted) {
      setValidationError('Você precisa aceitar o termo de participação para prosseguir.');
      return;
    }

    setSubmitState('submitting');

    try {
      // 1. Insert into people (anon policy enforces is_student=true, is_client=false, notes=null)
      const { data: person, error: personError } = await supabase
        .from('people')
        .insert({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          notes: null, // admin-only — never set here
          is_student: true,
          is_client: false,
        })
        .select()
        .single();

      if (personError) throw personError;

      // 2. Insert student profile with new self-report fields
      const { error: profileError } = await supabase
        .from('fialn_student_profiles')
        .insert({
          person_id: person.id,
          financial_status: 'em_dia', // admin default — anon policy enforces this
          shibari_experience: shibariExperience.trim() || null,
          shibari_goals: shibariGoals.trim() || null,
        });

      if (profileError) throw profileError;

      setSubmitState('success');
    } catch (err) {
      console.error('[PublicRegistrationPage] submit error:', err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro ao enviar seu cadastro. Tente novamente ou entre em contato.',
      );
      setSubmitState('error');
    }
  };

  // -------------------------------------------------------------------------
  // Success screen
  // -------------------------------------------------------------------------
  if (submitState === 'success') {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎋</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Cadastro recebido!
            </h2>
            <p style={{ color: 'var(--fi-color-text-muted)', lineHeight: 1.7, maxWidth: '340px', margin: '0 auto' }}>
              Obrigado pelo seu interesse. Em breve entraremos em contato para alinhar os próximos passos.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Registration form
  // -------------------------------------------------------------------------
  return (
    <div style={styles.pageWrapper}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logoIcon}>🎋</div>
        <h1 style={styles.logoTitle}>Cadastro de Aluno</h1>
        <p style={styles.logoSub}>Preencha os dados abaixo para se inscrever</p>
      </div>

      <div style={styles.card}>
        <form onSubmit={handleSubmit} className="stack-4">

          {/* ---- 1. Dados Pessoais ---- */}
          <SectionHeader icon="👤" title="Dados Pessoais" />

          <div className="form-group">
            <label className="form-label" htmlFor="reg-full-name">
              Nome Completo <span style={{ color: 'var(--fi-color-danger)' }}>*</span>
            </label>
            <input
              id="reg-full-name"
              type="text"
              className="form-input"
              placeholder="Ex: Maria Silva"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">
                Telefone / WhatsApp
              </label>
              <input
                id="reg-phone"
                type="tel"
                className="form-input"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">
                E-mail
              </label>
              <input
                id="reg-email"
                type="email"
                className="form-input"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* ---- 2. Experiência em Shibari ---- */}
          <SectionHeader icon="🪢" title="Experiência em Shibari" />

          <p style={styles.sectionHint}>
            Conte um pouco sobre sua trajetória. Considere incluir: tempo total de prática,
            oficinas e workshops que frequentou, aulas que já fez, figuras ou técnicas que
            domina, e como você se considera (iniciante, intermediário, avançado).
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-experience">
              Descreva sua experiência com Shibari
            </label>
            <textarea
              id="reg-experience"
              className="form-input"
              rows={6}
              placeholder="Ex: Pratico Shibari há 2 anos de forma autodidata. Fiz um workshop de 8 horas com [facilitador] em 2024. Domino o takate kote básico e alguns harnesses simples de quadril. Considero meu nível intermediário."
              value={shibariExperience}
              onChange={(e) => setShibariExperience(e.target.value)}
              style={{ resize: 'vertical' }}
              disabled={isSubmitting}
            />
          </div>

          {/* ---- 3. Objetivos ---- */}
          <SectionHeader icon="🎯" title="Objetivos no Shibari" />

          <p style={styles.sectionHint}>
            O que você deseja alcançar? Onde quer chegar? Quais são as suas expectativas
            com as aulas?
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-goals">
              Descreva seus objetivos
            </label>
            <textarea
              id="reg-goals"
              className="form-input"
              rows={4}
              placeholder="Ex: Quero aprender suspensões parciais com segurança, desenvolver uma linguagem estética própria e compreender melhor os aspectos de conexão e comunicação em cena."
              value={shibariGoals}
              onChange={(e) => setShibariGoals(e.target.value)}
              style={{ resize: 'vertical' }}
              disabled={isSubmitting}
            />
          </div>

          {/* ---- 4. Termo de Consentimento ---- */}
          <SectionHeader icon="📋" title="Termo de Participação" />

          <div style={styles.consentBox}>
            <p style={styles.consentIntro}>
              Ao marcar a caixa abaixo, você confirma que leu e concorda com os seguintes pontos:
            </p>
            <ul style={styles.consentList}>
              {CONSENT_PARAGRAPHS.map((paragraph, index) => (
                <li key={index} style={styles.consentItem}>
                  <span style={styles.consentBullet}>•</span>
                  <span>{paragraph}</span>
                </li>
              ))}
            </ul>

            <label style={styles.consentCheckboxLabel}>
              <input
                type="checkbox"
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
                disabled={isSubmitting}
                style={styles.consentCheckbox}
              />
              <span style={{ fontWeight: 600 }}>
                Li e concordo com todos os pontos do termo de participação acima.
              </span>
            </label>
          </div>

          {/* ---- Errors ---- */}
          {validationError && (
            <p className="form-error">⚠ {validationError}</p>
          )}
          {errorMessage && (
            <div className="alert alert-error">✗ {errorMessage}</div>
          )}

          {/* ---- Actions ---- */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              id="reg-submit-btn"
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !consentAccepted}
              style={{ minWidth: '180px' }}
            >
              {isSubmitting ? (
                <><span className="spinner" /> Enviando…</>
              ) : (
                '✓ Enviar Cadastro'
              )}
            </button>
          </div>

        </form>
      </div>

      <p style={styles.footer}>
        Já é aluno?{' '}
        <a href="/" style={{ color: 'var(--fi-color-primary)' }}>
          Acesse o portal
        </a>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div style={styles.sectionHeader}>
      <span style={styles.sectionIcon}>{icon}</span>
      <span style={styles.sectionTitle}>{title}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline styles (avoids coupling with admin-specific CSS classes)
// Uses the same CSS custom properties as the rest of the app
// ---------------------------------------------------------------------------

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    background: 'var(--fi-color-bg)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '2rem 1rem 4rem',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '2rem',
  },
  logoIcon: {
    fontSize: '3rem',
    marginBottom: '0.5rem',
  },
  logoTitle: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'var(--fi-color-text)',
    marginBottom: '0.35rem',
  },
  logoSub: {
    fontSize: '0.9rem',
    color: 'var(--fi-color-text-muted)',
  },
  card: {
    background: 'var(--fi-color-surface)',
    border: '1px solid var(--fi-color-border)',
    borderRadius: 'var(--fi-radius-lg)',
    padding: '2rem',
    width: '100%',
    maxWidth: '600px',
    boxShadow: 'var(--fi-shadow-md)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    paddingTop: '0.5rem',
    paddingBottom: '0.25rem',
    borderBottom: '1px solid var(--fi-color-border)',
    marginBottom: '0.25rem',
    marginTop: '0.5rem',
  },
  sectionIcon: {
    fontSize: '1.1rem',
  },
  sectionTitle: {
    fontWeight: 700,
    fontSize: '0.95rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    color: 'var(--fi-color-primary)',
  },
  sectionHint: {
    fontSize: '0.83rem',
    color: 'var(--fi-color-text-muted)',
    lineHeight: 1.65,
    marginBottom: '0.25rem',
  },
  consentBox: {
    background: 'var(--fi-color-surface-2)',
    border: '1px solid var(--fi-color-border)',
    borderRadius: 'var(--fi-radius-md)',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  consentIntro: {
    fontSize: '0.85rem',
    color: 'var(--fi-color-text-muted)',
    fontStyle: 'italic' as const,
  },
  consentList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.6rem',
    paddingLeft: 0,
  },
  consentItem: {
    display: 'flex',
    gap: '0.5rem',
    fontSize: '0.875rem',
    lineHeight: 1.6,
    color: 'var(--fi-color-text)',
  },
  consentBullet: {
    color: 'var(--fi-color-primary)',
    flexShrink: 0,
    marginTop: '0.15rem',
  },
  consentCheckboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.65rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    paddingTop: '0.5rem',
    borderTop: '1px solid var(--fi-color-border)',
    marginTop: '0.25rem',
  },
  consentCheckbox: {
    width: '1.1rem',
    height: '1.1rem',
    flexShrink: 0,
    marginTop: '0.15rem',
    accentColor: 'var(--fi-color-primary)',
    cursor: 'pointer',
  },
  footer: {
    marginTop: '1.5rem',
    fontSize: '0.83rem',
    color: 'var(--fi-color-text-muted)',
    textAlign: 'center' as const,
  },
} as const;

export default PublicRegistrationPage;
