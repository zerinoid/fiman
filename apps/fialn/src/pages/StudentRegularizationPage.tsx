import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface LegalTermsPayload {
  version: string;
  title: string;
  paragraphs: string[];
}

interface StudentRegularizationData {
  person_id: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  cpf?: string | null;
  shibari_experience?: string | null;
  shibari_goals?: string | null;
  terms_accepted_at?: string | null;
  terms_version?: string | null;
  email_verified_at?: string | null;
  is_expired?: boolean;
  legal_terms?: LegalTermsPayload;
}

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

function formatDate(isoString?: string | null): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function StudentRegularizationPage() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [shibariExperience, setShibariExperience] = useState('');
  const [shibariGoals, setShibariGoals] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);

  // Original state loaded
  const [originalData, setOriginalData] = useState<StudentRegularizationData | null>(null);
  const [legalTerms, setLegalTerms] = useState<LegalTermsPayload>({
    version: 'v1.0',
    title: 'Termo de Ciência & Consentimento de Participação',
    paragraphs: [
      'Afirmo que todas as informações prestadas neste formulário são verdadeiras e completas.',
      'Entendo que minha experiência prévia em Shibari é informação determinante para que o facilitador possa oferecer a melhor orientação pedagógica possível.',
      'Estou ciente de que, salvo comunicação prévia e explícita do facilitador, devo comparecer às aulas acompanhado(a) de um(a) modelo.',
      'Confirmo que dediquei tempo para ler e estudar os fundamentos básicos de segurança em Shibari antes de iniciar as aulas, compreendendo que a segurança é responsabilidade compartilhada entre praticantes.',
    ],
  });

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    full_name: string;
    email: string;
    terms_version: string;
    terms_accepted_at: string;
  } | null>(null);

  // Load data by token from URL hash (#termo?token=... or #regularizar?token=...)
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    const [, queryPart] = hash.split('?');
    const params = new URLSearchParams(queryPart ?? '');
    const rawToken = params.get('token');

    if (!rawToken) {
      setError('Token de regularização não encontrado no endereço.');
      setLoading(false);
      return;
    }

    const validToken = rawToken;
    setToken(validToken);

    async function loadData() {
      try {
        const { data: res, error: rpcErr } = await supabase.rpc('get_student_regularization_data', {
          p_token: validToken,
        });

        if (rpcErr) throw rpcErr;

        const result = res as (StudentRegularizationData & { success?: boolean; error?: string }) | null;
        if (!result || result.success === false) {
          throw new Error(result?.error || 'Inscrição ou link não encontrado.');
        }

        setOriginalData(result);

        // Pre-fill form fields
        if (result.first_name) {
          setFirstName(result.first_name);
        } else if (result.full_name) {
          const parts = result.full_name.trim().split(' ');
          setFirstName(parts[0]);
          setLastName(parts.slice(1).join(' '));
        }

        if (result.last_name) {
          setLastName(result.last_name);
        }

        if (result.email) setEmail(result.email);
        if (result.phone) setPhone(result.phone);
        if (result.cpf) setCpf(formatCpf(result.cpf));
        if (result.shibari_experience) setShibariExperience(result.shibari_experience);
        if (result.shibari_goals) setShibariGoals(result.shibari_goals);

        if (result.legal_terms) {
          setLegalTerms(result.legal_terms);
        }

        // If already verified and accepted terms previously
        if (result.terms_accepted_at && result.email_verified_at) {
          setConsentAccepted(true);
        }
      } catch (err) {
        console.error('[StudentRegularizationPage] load error:', err);
        setError(err instanceof Error ? err.message : 'Não foi possível carregar os dados de regularização.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Client-side validations
    const cleanFirst = firstName.trim();
    if (!cleanFirst || cleanFirst.length < 2) {
      setSubmitError('Nome é obrigatório (mínimo de 2 caracteres).');
      return;
    }

    const cleanLast = lastName.trim();
    if (!cleanLast || cleanLast.length < 2) {
      setSubmitError('Sobrenome é obrigatório (mínimo de 2 caracteres).');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setSubmitError('Informe um e-mail válido.');
      return;
    }

    const cleanPhoneDigits = phone.replace(/\D/g, '');
    if (!cleanPhoneDigits || cleanPhoneDigits.length < 10) {
      setSubmitError('WhatsApp válido com DDD é obrigatório.');
      return;
    }

    const cleanCpfDigits = cpf.replace(/\D/g, '');
    if (cleanCpfDigits && cleanCpfDigits.length !== 11) {
      setSubmitError('CPF deve conter 11 dígitos numéricos.');
      return;
    }

    if (!consentAccepted) {
      setSubmitError('É necessário confirmar a leitura e o aceite dos termos de participação.');
      return;
    }

    if (!token) return;

    setSubmitting(true);

    try {
      const computedFullName = `${cleanFirst} ${cleanLast}`.trim();

      const { data: res, error: rpcErr } = await supabase.rpc('submit_student_regularization', {
        p_token: token,
        p_first_name: cleanFirst,
        p_last_name: cleanLast,
        p_email: cleanEmail,
        p_phone: phone.trim(),
        p_cpf: cleanCpfDigits || undefined,
        p_shibari_experience: shibariExperience.trim() || undefined,
        p_shibari_goals: shibariGoals.trim() || undefined,
        p_full_name: computedFullName,
      });

      if (rpcErr) throw rpcErr;

      const result = res as {
        success?: boolean;
        full_name?: string;
        email?: string;
        terms_version?: string;
        terms_accepted_at?: string;
      } | null;

      if (!result || result.success === false) {
        throw new Error('Erro ao salvar as informações de regularização.');
      }

      setSuccessInfo({
        full_name: result.full_name || computedFullName,
        email: result.email || cleanEmail,
        terms_version: result.terms_version || legalTerms.version,
        terms_accepted_at: result.terms_accepted_at || new Date().toISOString(),
      });
      setIsSuccess(true);
    } catch (err) {
      console.error('[StudentRegularizationPage] submit error:', err);
      setSubmitError(err instanceof Error ? err.message : 'Erro ao submeter regularização.');
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // Success Screen
  // -------------------------------------------------------------------------
  if (isSuccess && successInfo) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--fi-color-text)' }}>
              Cadastro Regularizado com Sucesso!
            </h1>
            <p style={{ color: 'var(--fi-color-text-muted)', lineHeight: 1.6, maxWidth: '460px', margin: '0 auto 1.5rem' }}>
              Obrigado, <strong>{successInfo.full_name}</strong>! Seus dados e a confirmação do seu e-mail foram registrados com segurança.
            </p>

            <div style={{
              background: 'var(--fi-color-surface-2)',
              border: '1px solid var(--fi-color-border)',
              borderRadius: 'var(--fi-radius-md)',
              padding: '1.25rem',
              maxWidth: '460px',
              margin: '0 auto 1.5rem',
              textAlign: 'left',
              fontSize: '0.875rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}>
              <div>
                <span style={{ color: 'var(--fi-color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  E-mail Confirmado
                </span>
                <div style={{ fontWeight: 600, color: 'var(--fi-color-text)', marginTop: '2px' }}>
                  {successInfo.email}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--fi-color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Termo de Participação & Segurança
                </span>
                <div style={{ fontWeight: 600, color: 'var(--fi-color-text)', marginTop: '2px' }}>
                  {successInfo.terms_version} · Aceito em {formatDate(successInfo.terms_accepted_at)}
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--fi-radius-md)',
              padding: '0.85rem 1rem',
              maxWidth: '460px',
              margin: '0 auto',
              color: '#10b981',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}>
              <span>✓</span> Tudo certo para suas próximas aulas!
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Main Page View
  // -------------------------------------------------------------------------
  return (
    <div style={styles.pageWrapper}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logoIcon}>🎋</div>
        <h1 style={styles.logoTitle}>Atualização & Aceite de Termos</h1>
        <p style={styles.logoSub}>
          Confirme seus dados cadastrais e aceite o termo de segurança e participação das aulas de Shibari.
        </p>
      </div>

      <div style={styles.card}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div className="spinner spinner-lg" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--fi-color-text-muted)' }}>Localizando seus dados…</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--fi-color-danger)' }}>
              Link Inválido ou Não Localizado
            </h2>
            <p style={{ color: 'var(--fi-color-text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {error}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--fi-color-text-muted)' }}>
              Por favor, entre em contato diretamente pelo WhatsApp para receber um novo link.
            </p>
          </div>
        ) : originalData?.is_expired ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏱️</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--fi-color-warning)' }}>
              Link Expirado
            </h2>
            <p style={{ color: 'var(--fi-color-text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Este link individual ultrapassou o prazo de validade. Solicite um novo link de regularização pelo WhatsApp.
            </p>
          </div>
        ) : originalData ? (
          <form onSubmit={handleSubmit} className="stack-4">
            {/* Banner for already accepted */}
            {originalData.terms_accepted_at && originalData.email_verified_at && (
              <div style={styles.alreadyAcceptedBanner}>
                <div style={{ fontSize: '1.3rem' }}>✓</div>
                <div>
                  <div style={{ fontWeight: 700, color: '#10b981' }}>Termo já assinado anteriormente</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--fi-color-text-muted)', marginTop: '2px' }}>
                    Você já aceitou o termo ({originalData.terms_version}) em {formatDate(originalData.terms_accepted_at)}. Você pode atualizar seus dados abaixo caso deseje.
                  </div>
                </div>
              </div>
            )}

            {/* Section: Dados Pessoais */}
            <div style={styles.sectionHeader}>
              <span style={styles.sectionIcon}>👤</span>
              <span style={styles.sectionTitle}>Seus Dados Cadastrais</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-first-name">
                  Nome <span style={{ color: 'var(--fi-color-danger)' }}>*</span>
                </label>
                <input
                  id="reg-first-name"
                  type="text"
                  className="form-input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Seu primeiro nome"
                  required
                  disabled={submitting}
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
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Seu sobrenome"
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">
                E-mail de Contato <span style={{ color: 'var(--fi-color-danger)' }}>*</span>
              </label>
              <input
                id="reg-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                required
                disabled={submitting}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--fi-color-text-muted)', marginTop: '2px' }}>
                Utilizado para avisos importantes e confirmação de participação.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-phone">
                  WhatsApp com DDD <span style={{ color: 'var(--fi-color-danger)' }}>*</span>
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-cpf">
                  CPF
                </label>
                <input
                  id="reg-cpf"
                  type="text"
                  className="form-input"
                  value={cpf}
                  onChange={(e) => setCpf(formatCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Section: Shibari Details */}
            <div style={styles.sectionHeader}>
              <span style={styles.sectionIcon}>🪢</span>
              <span style={styles.sectionTitle}>Experiência & Objetivos</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-exp">
                Experiência prévia com Shibari
              </label>
              <textarea
                id="reg-exp"
                className="form-input"
                rows={2}
                value={shibariExperience}
                onChange={(e) => setShibariExperience(e.target.value)}
                placeholder="Ex: Já pratico há 1 ano, cursos anteriores, auto-amarração..."
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-goals">
                Seus objetivos nas aulas
              </label>
              <textarea
                id="reg-goals"
                className="form-input"
                rows={2}
                value={shibariGoals}
                onChange={(e) => setShibariGoals(e.target.value)}
                placeholder="Ex: Aprender suspensões, aprimorar nós de chão, conexão..."
                disabled={submitting}
              />
            </div>

            {/* Section: Legal Terms */}
            <div style={styles.sectionHeader}>
              <span style={styles.sectionIcon}>📜</span>
              <span style={styles.sectionTitle}>{legalTerms.title} ({legalTerms.version})</span>
            </div>

            <div style={styles.termsBox}>
              {legalTerms.paragraphs.map((clause, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--fi-color-primary)', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0, marginTop: '1px' }}>
                    {idx + 1}.
                  </span>
                  <span style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--fi-color-text)' }}>
                    {clause}
                  </span>
                </div>
              ))}
            </div>

            {/* Consent Checkbox */}
            <label style={styles.checkboxLabel}>
              <input
                id="reg-consent"
                type="checkbox"
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
                disabled={submitting}
                style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: 'var(--fi-color-primary)', flexShrink: 0 }}
                required
              />
              <span style={{ fontSize: '0.875rem', lineHeight: 1.5, color: 'var(--fi-color-text)' }}>
                <strong>Li, compreendo e concordo</strong> com os termos de participação, segurança e responsabilidade compartilhada acima descritos.
              </span>
            </label>

            {submitError && (
              <div style={styles.errorAlert}>
                <span>⚠️</span> {submitError}
              </div>
            )}

            {/* Submit Button */}
            <button
              id="reg-submit-btn"
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !consentAccepted}
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: 700, marginTop: '0.5rem' }}
            >
              {submitting ? (
                <><span className="spinner" /> Gravando confirmação…</>
              ) : (
                '✓ Confirmar Dados e Aceitar Termo'
              )}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    background: 'var(--fi-color-bg)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '2.5rem 1rem 4rem',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '1.75rem',
  },
  logoIcon: {
    fontSize: '2.75rem',
    marginBottom: '0.4rem',
  },
  logoTitle: {
    fontSize: '1.65rem',
    fontWeight: 700,
    color: 'var(--fi-color-text)',
    marginBottom: '0.35rem',
  },
  logoSub: {
    fontSize: '0.9rem',
    color: 'var(--fi-color-text-muted)',
    maxWidth: '460px',
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
    paddingTop: '0.75rem',
    paddingBottom: '0.35rem',
    borderBottom: '1px solid var(--fi-color-border)',
    marginTop: '0.5rem',
  },
  sectionIcon: {
    fontSize: '1.1rem',
  },
  sectionTitle: {
    fontWeight: 700,
    fontSize: '0.85rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    color: 'var(--fi-color-primary)',
  },
  termsBox: {
    background: 'var(--fi-color-surface-2)',
    border: '1px solid var(--fi-color-border)',
    borderRadius: 'var(--fi-radius-md)',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    maxHeight: '260px',
    overflowY: 'auto' as const,
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    cursor: 'pointer',
    padding: '0.75rem',
    background: 'var(--fi-color-surface-2)',
    border: '1px solid var(--fi-color-border)',
    borderRadius: 'var(--fi-radius-md)',
  },
  errorAlert: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: 'var(--fi-color-danger)',
    borderRadius: 'var(--fi-radius-md)',
    padding: '0.75rem 1rem',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  alreadyAcceptedBanner: {
    background: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    borderRadius: 'var(--fi-radius-md)',
    padding: '0.85rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
} as const;

export default StudentRegularizationPage;
