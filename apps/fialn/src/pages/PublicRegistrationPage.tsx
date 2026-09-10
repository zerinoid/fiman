import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

interface CourseOption {
  id: string;
  title: string;
  schedule_day: string;
  skill_level: string;
  active: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatWeekday(scheduleDay: string): string {
  const day = scheduleDay.trim().toLowerCase();
  switch (day) {
    case 'monday':
    case 'segunda':
    case 'segunda-feira':
      return 'Segunda-feira';
    case 'tuesday':
    case 'terça':
    case 'terca':
    case 'terça-feira':
      return 'Terça-feira';
    case 'wednesday':
    case 'quarta':
    case 'quarta-feira':
      return 'Quarta-feira';
    case 'thursday':
    case 'quinta':
    case 'quinta-feira':
      return 'Quinta-feira';
    case 'friday':
    case 'sexta':
    case 'sexta-feira':
      return 'Sexta-feira';
    case 'saturday':
    case 'sábado':
    case 'sabado':
      return 'Sábado';
    case 'sunday':
    case 'domingo':
      return 'Domingo';
    default:
      return scheduleDay;
  }
}

function formatLevel(level: string): string {
  const lvl = level.trim().toLowerCase();
  switch (lvl) {
    case 'beginner':
    case 'iniciante':
      return 'Iniciante';
    case 'intermediate':
    case 'intermediário':
    case 'intermediario':
      return 'Intermediário';
    case 'advanced':
    case 'avançado':
    case 'avancado':
      return 'Avançado';
    default:
      return level;
  }
}

const CONSENT_PARAGRAPHS = [
  'Afirmo que todas as informações prestadas neste formulário são verdadeiras e completas.',
  'Entendo que minha experiência prévia em Shibari é informação determinante para que o facilitador possa oferecer a melhor orientação pedagógica possível.',
  'Estou ciente de que, salvo comunicação prévia e explícita do facilitador, devo comparecer às aulas acompanhado(a) de um(a) modelo.',
  'Confirmo que dediquei tempo para ler e estudar os fundamentos básicos de segurança em Shibari antes de iniciar as aulas, compreendendo que a segurança é responsabilidade compartilhada entre praticantes.',
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export function PublicRegistrationPage() {
  // --- Form state ---
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [coursePreferenceId, setCoursePreferenceId] = useState('');
  const [shibariExperience, setShibariExperience] = useState('');
  const [shibariGoals, setShibariGoals] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);

  // Honeypot anti-bot field
  const [botTrap, setBotTrap] = useState('');

  // Course list loaded from fiteo_courses
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Legal terms dynamically loaded from legal_terms (fallback to static CONSENT_PARAGRAPHS)
  const [legalTerms, setLegalTerms] = useState<{
    version: string;
    title: string;
    paragraphs: string[];
  }>({
    version: 'v1.0',
    title: 'Termo de Participação',
    paragraphs: CONSENT_PARAGRAPHS,
  });

  // --- Submission state ---
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isSubmitting = submitState === 'submitting';

  // --- Fetch active courses from fiteo_courses ---
  useEffect(() => {
    async function loadCourses() {
      try {
        const { data, error } = await supabase
          .from('fiteo_courses')
          .select('id, title, schedule_day, skill_level, active')
          .eq('active', true)
          .order('title', { ascending: true });

        if (!error && data) {
          setCourses(data as CourseOption[]);
        }
      } catch (err) {
        console.warn('Não foi possível carregar os cursos:', err);
      } finally {
        setLoadingCourses(false);
      }
    }

    async function loadLegalTerms() {
      try {
        const { data, error } = await supabase
          .from('legal_terms')
          .select('version, title, paragraphs, is_active')
          .eq('term_type', 'fialn_student_registration')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data && Array.isArray(data.paragraphs) && data.paragraphs.length > 0) {
          setLegalTerms({
            version: data.version,
            title: data.title,
            paragraphs: data.paragraphs as string[],
          });
        }
      } catch (err) {
        console.warn('Não foi possível carregar os termos do servidor:', err);
      }
    }

    loadCourses();
    loadLegalTerms();
  }, []);

  // --- Client-side validation ---
  const validateForm = (): string | null => {
    const cleanFirst = firstName.trim();
    if (!cleanFirst || cleanFirst.length < 2) {
      return 'Nome é obrigatório (mínimo de 2 caracteres).';
    }

    const cleanLast = lastName.trim();
    if (!cleanLast || cleanLast.length < 2) {
      return 'Sobrenome é obrigatório (mínimo de 2 caracteres).';
    }

    const cleanCpf = cpf.replace(/\D/g, '');
    if (!cleanCpf || cleanCpf.length !== 11) {
      return 'Documento (CPF) é obrigatório e deve conter 11 dígitos numéricos.';
    }

    const cleanDigits = phone.replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length < 10) {
      return 'WhatsApp é obrigatório com DDD (mínimo de 10 dígitos).';
    }

    const cleanEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return 'Informe um e-mail válido (ex: seu@email.com).';
    }

    if (!consentAccepted) {
      return 'Você precisa aceitar os termos de participação para concluir o cadastro.';
    }

    return null;
  };

  // --- Submit handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setErrorMessage(null);

    // Bot trap check
    if (botTrap) {
      // Silently fake success for bots
      setSubmitState('success');
      return;
    }

    const error = validateForm();
    if (error) {
      setValidationError(error);
      return;
    }

    setSubmitState('submitting');

    try {
      const cleanDigitsCpf = cpf.replace(/\D/g, '');
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

      // Call SECURITY DEFINER RPC to safely insert data without table-level RLS restrictions
      const { data, error: rpcError } = await supabase.rpc('register_student_public', {
        p_first_name: firstName.trim(),
        p_last_name: lastName.trim(),
        p_cpf: cleanDigitsCpf,
        p_phone: phone.trim(),
        p_email: email.trim().toLowerCase(),
        p_course_preference_id: coursePreferenceId ? coursePreferenceId : null,
        p_shibari_experience: shibariExperience.trim() || null,
        p_shibari_goals: shibariGoals.trim() || null,
        p_full_name: fullName,
      });

      if (rpcError) {
        throw rpcError;
      }

      const res = data as { success?: boolean; person_id?: string } | null;
      if (res && res.success === false) {
        throw new Error('Não foi possível registrar o cadastro.');
      }

      setSubmitState('success');
    } catch (err) {
      console.error('[PublicRegistrationPage] submit error:', err);
      let userMsg = 'Ocorreu um erro ao enviar seu cadastro. Tente novamente ou entre em contato.';
      if (err instanceof Error) {
        userMsg = err.message;
      }
      setErrorMessage(userMsg);
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
              Cadastro recebido com sucesso!
            </h2>
            <p style={{ color: 'var(--fi-color-text-muted)', lineHeight: 1.7, maxWidth: '380px', margin: '0 auto' }}>
              Obrigado pelo seu interesse. Suas informações foram enviadas e em breve entraremos em contato pelo WhatsApp para alinhar os detalhes da sua participação.
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
        <p style={styles.logoSub}>Preencha seus dados para inscrição nos cursos e acompanhamento</p>
      </div>

      <div style={styles.card}>
        <form onSubmit={handleSubmit} className="stack-4">

          {/* Honeypot field (hidden from human users) */}
          <div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
            <label htmlFor="website-trap">Deixe este campo em branco</label>
            <input
              id="website-trap"
              type="text"
              name="website_trap"
              tabIndex={-1}
              value={botTrap}
              onChange={(e) => setBotTrap(e.target.value)}
              autoComplete="off"
            />
          </div>

          {/* ---- 1. Dados Pessoais ---- */}
          <SectionHeader icon="👤" title="Dados Pessoais" />

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-first-name">
                Nome <span style={{ color: 'var(--fi-color-danger)' }}>*</span>
              </label>
              <input
                id="reg-first-name"
                type="text"
                className="form-input"
                placeholder="Ex: Maria"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-last-name">
                Sobrenome <span style={{ color: 'var(--fi-color-danger)' }}>*</span>
              </label>
              <input
                id="reg-last-name"
                type="text"
                className="form-input"
                placeholder="Ex: Silva"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-cpf">
                Documento (CPF) <span style={{ color: 'var(--fi-color-danger)' }}>*</span>
              </label>
              <input
                id="reg-cpf"
                type="text"
                className="form-input"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(formatCpf(e.target.value))}
                required
                disabled={isSubmitting}
                maxLength={14}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">
                WhatsApp <span style={{ color: 'var(--fi-color-danger)' }}>*</span>
              </label>
              <input
                id="reg-phone"
                type="tel"
                className="form-input"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">
              E-mail <span style={{ color: 'var(--fi-color-danger)' }}>*</span>
            </label>
            <input
              id="reg-email"
              type="email"
              className="form-input"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* ---- 2. Preferência de Turma / Curso (fiteo_courses) ---- */}
          <SectionHeader icon="📅" title="Curso & Dia de Preferência" />

          <div className="form-group">
            <label className="form-label" htmlFor="reg-course-pref">
              Qual curso / dia da semana você tem interesse em frequentar?
            </label>
            <select
              id="reg-course-pref"
              className="form-input"
              value={coursePreferenceId}
              onChange={(e) => setCoursePreferenceId(e.target.value)}
              disabled={isSubmitting || loadingCourses}
            >
              <option value="">Selecione uma opção (opcional)</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title} — {formatWeekday(course.schedule_day)} (Nível {formatLevel(course.skill_level)})
                </option>
              ))}
              <option value="">Ainda não sei / Outro horário / Aulas particulares</option>
            </select>
          </div>

          {/* ---- 3. Experiência em Shibari ---- */}
          <SectionHeader icon="🪢" title="Experiência em Shibari" />

          <p style={styles.sectionHint}>
            Conte um pouco sobre sua trajetória com Shibari: tempo total de prática,
            oficinas/workshops que frequentou, aulas que já fez, figuras ou técnicas que
            domina e como você se considera (iniciante, intermediário, avançado).
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-experience">
              Descreva sua experiência com Shibari
            </label>
            <textarea
              id="reg-experience"
              className="form-input"
              rows={5}
              placeholder="Ex: Pratico Shibari há 1 ano de forma autodidata. Participei de um workshop introdutório. Domino takate kote e algumas amarrações básicas de pernas e quadril. Me considero iniciante."
              value={shibariExperience}
              onChange={(e) => setShibariExperience(e.target.value)}
              style={{ resize: 'vertical' }}
              disabled={isSubmitting}
              maxLength={5000}
            />
          </div>

          {/* ---- 4. Objetivos ---- */}
          <SectionHeader icon="🎯" title="Objetivos no Shibari" />

          <p style={styles.sectionHint}>
            O que você deseja obter com as aulas e onde quer chegar na sua prática?
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-goals">
              Descreva seus objetivos
            </label>
            <textarea
              id="reg-goals"
              className="form-input"
              rows={4}
              placeholder="Ex: Desenvolver fluência nas amarrações no chão, aprofundar em anatomia e segurança para suspensões, e explorar conexão e dinâmicas de improvisação."
              value={shibariGoals}
              onChange={(e) => setShibariGoals(e.target.value)}
              style={{ resize: 'vertical' }}
              disabled={isSubmitting}
              maxLength={5000}
            />
          </div>

          {/* ---- 5. Termo de Consentimento ---- */}
          <SectionHeader icon="📋" title={legalTerms.title || 'Termo de Participação'} />

          <div style={styles.consentBox}>
            <p style={styles.consentIntro}>
              Ao marcar a caixa de confirmação abaixo, você declara e concorda com:
            </p>
            <ul style={styles.consentList}>
              {legalTerms.paragraphs.map((paragraph, index) => (
                <li key={index} style={styles.consentItem}>
                  <span style={styles.consentBullet}>•</span>
                  <span>{paragraph}</span>
                </li>
              ))}
            </ul>

            <div style={{ fontSize: '0.72rem', color: 'var(--fi-color-text-muted)', marginBottom: '0.85rem' }}>
              Documento de adesão: <strong>{legalTerms.title} ({legalTerms.version})</strong>
            </div>

            <label style={styles.consentCheckboxLabel}>
              <input
                type="checkbox"
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
                disabled={isSubmitting}
                style={styles.consentCheckbox}
              />
              <span style={{ fontWeight: 600 }}>
                Li, compreendo e concordo com todos os pontos do termo de participação acima ({legalTerms.version}). <span style={{ color: 'var(--fi-color-danger)' }}>*</span>
              </span>
            </label>
          </div>

          {/* ---- Errors ---- */}
          {validationError && (
            <div className="alert alert-error" style={{ fontSize: '0.875rem' }}>
              ⚠ {validationError}
            </div>
          )}
          {errorMessage && (
            <div className="alert alert-error" style={{ fontSize: '0.875rem' }}>
              ✗ {errorMessage}
            </div>
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
        Já é aluno matriculado?{' '}
        <a href="/" style={{ color: 'var(--fi-color-primary)' }}>
          Acesse o painel
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
// Inline styles
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
    maxWidth: '420px',
    lineHeight: 1.5,
  },
  card: {
    background: 'var(--fi-color-surface)',
    border: '1px solid var(--fi-color-border)',
    borderRadius: 'var(--fi-radius-lg)',
    padding: '2rem',
    width: '100%',
    maxWidth: '620px',
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
