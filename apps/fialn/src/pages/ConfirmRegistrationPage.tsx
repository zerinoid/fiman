import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface RegistrationData {
  full_name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  course_title?: string;
  schedule_day?: string;
  skill_level?: string;
  shibari_experience?: string;
  shibari_goals?: string;
  terms_accepted_at?: string;
  terms_version?: string;
  email_verified_at?: string | null;
  is_expired?: boolean;
}

function formatWeekday(scheduleDay?: string): string {
  if (!scheduleDay) return '';
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

export function ConfirmRegistrationPage() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [data, setData] = useState<RegistrationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);

  // Extract token from hash query parameter: #confirmar-cadastro?token=...
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    const [, queryPart] = hash.split('?');
    const params = new URLSearchParams(queryPart ?? '');
    const rawToken = params.get('token');
    if (!rawToken) {
      setError('Token de confirmação não encontrado no endereço.');
      setLoading(false);
      return;
    }

    const validToken = rawToken;
    setToken(validToken);

    async function loadData() {
      try {
        const { data: res, error: rpcErr } = await supabase.rpc('get_student_registration_by_token', {
          p_token: validToken,
        });

        if (rpcErr) throw rpcErr;

        const reg = res as (RegistrationData & { success?: boolean; error?: string }) | null;
        if (!reg || reg.success === false) {
          throw new Error(reg?.error || 'Inscrição não encontrada para o link fornecido.');
        }

        setData(reg);
        if (reg.email_verified_at) {
          setConfirmedAt(reg.email_verified_at);
        }
      } catch (err) {
        console.error('[ConfirmRegistrationPage] load error:', err);
        setError(err instanceof Error ? err.message : 'Não foi possível carregar os dados de inscrição.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleConfirm = async () => {
    if (!token) return;
    setConfirming(true);
    setError(null);

    try {
      const { data: res, error: rpcErr } = await supabase.rpc('confirm_student_registration', {
        p_token: token,
      });

      if (rpcErr) throw rpcErr;

      const result = res as { success?: boolean; error?: string; verified_at?: string; already_confirmed?: boolean } | null;
      if (!result || result.success === false) {
        throw new Error(result?.error || 'Erro ao confirmar a inscrição.');
      }

      setConfirmedAt(result.verified_at || new Date().toISOString());
    } catch (err) {
      console.error('[ConfirmRegistrationPage] confirm error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao confirmar a inscrição.');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logoIcon}>🎋</div>
        <h1 style={styles.logoTitle}>Confirmação de Pré-Matrícula</h1>
        <p style={styles.logoSub}>Revise suas respostas e confirme seu e-mail para validar a sua inscrição</p>
      </div>

      <div style={styles.card}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div className="spinner spinner-lg" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--fi-color-text-muted)' }}>Localizando seus dados de cadastro…</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--fi-color-danger)' }}>
              Atenção
            </h2>
            <p style={{ color: 'var(--fi-color-text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {error}
            </p>
            <a href="/#cadastro" className="btn btn-secondary">
              Voltar à página de cadastro
            </a>
          </div>
        ) : data?.is_expired ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏱️</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--fi-color-warning)' }}>
              Link Expirado
            </h2>
            <p style={{ color: 'var(--fi-color-text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Este link de confirmação ultrapassou o prazo de validade de 72 horas. Por favor, envie um novo cadastro ou entre em contato diretamente conosco.
            </p>
            <a href="/#cadastro" className="btn btn-primary">
              Preencher Novo Cadastro
            </a>
          </div>
        ) : data ? (
          <div className="stack-4">
            {/* Status Banner */}
            {confirmedAt ? (
              <div style={styles.confirmedBanner}>
                <div style={{ fontSize: '1.4rem' }}>✓</div>
                <div>
                  <div style={{ fontWeight: 700, color: '#10b981' }}>Pré-Matrícula Confirmada!</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--fi-color-text-muted)', marginTop: '2px' }}>
                    E-mail verificado com sucesso em {formatDate(confirmedAt)}.
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.pendingBanner}>
                <div style={{ fontSize: '1.3rem' }}>✉️</div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--fi-color-primary)' }}>Confirmação Pendente</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--fi-color-text-muted)', marginTop: '2px' }}>
                    Confira as informações abaixo e clique em confirmar para validar sua participação.
                  </div>
                </div>
              </div>
            )}

            {/* Student Details Summary */}
            <div style={styles.sectionHeader}>
              <span style={styles.sectionIcon}>👤</span>
              <span style={styles.sectionTitle}>Dados Pessoais</span>
            </div>

            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Nome Completo</span>
                <span style={styles.infoValue}>{data.full_name}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>E-mail</span>
                <span style={styles.infoValue}>{data.email}</span>
              </div>
              {data.phone && (
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>WhatsApp</span>
                  <span style={styles.infoValue}>{data.phone}</span>
                </div>
              )}
            </div>

            {/* Course Preference */}
            <div style={styles.sectionHeader}>
              <span style={styles.sectionIcon}>📅</span>
              <span style={styles.sectionTitle}>Curso de Preferência</span>
            </div>

            <div style={styles.highlightCard}>
              {data.course_title ? (
                <>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--fi-color-text)' }}>
                    {data.course_title}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--fi-color-text-muted)', marginTop: '4px' }}>
                    {formatWeekday(data.schedule_day)}
                    {data.skill_level ? ` • Nível: ${data.skill_level}` : ''}
                  </div>
                </>
              ) : (
                <div style={{ color: 'var(--fi-color-text-muted)', fontStyle: 'italic' }}>
                  Ainda não definido / Horário a combinar
                </div>
              )}
            </div>

            {/* Shibari Experience */}
            <div style={styles.sectionHeader}>
              <span style={styles.sectionIcon}>🪢</span>
              <span style={styles.sectionTitle}>Experiência Declarada</span>
            </div>
            <div style={styles.textBlock}>
              {data.shibari_experience || (
                <span style={{ color: 'var(--fi-color-text-muted)', fontStyle: 'italic' }}>Não informada</span>
              )}
            </div>

            {/* Goals */}
            <div style={styles.sectionHeader}>
              <span style={styles.sectionIcon}>🎯</span>
              <span style={styles.sectionTitle}>Objetivos no Shibari</span>
            </div>
            <div style={styles.textBlock}>
              {data.shibari_goals || (
                <span style={{ color: 'var(--fi-color-text-muted)', fontStyle: 'italic' }}>Não informados</span>
              )}
            </div>

            {/* Terms Footer */}
            {data.terms_version && (
              <div style={{ fontSize: '0.75rem', color: 'var(--fi-color-text-muted)', paddingTop: '0.5rem' }}>
                Termo de participação aceito: <strong>{data.terms_version}</strong>
                {data.terms_accepted_at ? ` em ${formatDate(data.terms_accepted_at)}` : ''}.
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--fi-color-border)' }}>
              {!confirmedAt ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirm}
                  disabled={confirming}
                  style={{ width: '100%', padding: '0.85rem 1rem', fontSize: '1rem', fontWeight: 700 }}
                >
                  {confirming ? (
                    <><span className="spinner" /> Confirmando…</>
                  ) : (
                    '✓ Confirmar Meus Dados e Concluir Pré-Matrícula'
                  )}
                </button>
              ) : (
                <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                  <p style={{ color: 'var(--fi-color-text-muted)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.6 }}>
                    Tudo certo! Em breve entraremos em contato com você pelo WhatsApp para alinhar os detalhes da sua primeira aula.
                  </p>
                  <a href="/#cadastro" className="btn btn-secondary" style={{ display: 'inline-block' }}>
                    ← Voltar ao Início
                  </a>
                </div>
              )}
            </div>
          </div>
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
    paddingBottom: '0.25rem',
    borderBottom: '1px solid var(--fi-color-border)',
    marginTop: '0.5rem',
  },
  sectionIcon: {
    fontSize: '1.1rem',
  },
  sectionTitle: {
    fontWeight: 700,
    fontSize: '0.875rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    color: 'var(--fi-color-primary)',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
    padding: '0.5rem 0',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.2rem',
  },
  infoLabel: {
    fontSize: '0.75rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    color: 'var(--fi-color-text-muted)',
  },
  infoValue: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--fi-color-text)',
  },
  highlightCard: {
    background: 'var(--fi-color-surface-2)',
    border: '1px solid var(--fi-color-border)',
    borderRadius: 'var(--fi-radius-md)',
    padding: '1rem',
  },
  textBlock: {
    background: 'var(--fi-color-surface-2)',
    border: '1px solid var(--fi-color-border)',
    borderRadius: 'var(--fi-radius-md)',
    padding: '0.875rem 1rem',
    fontSize: '0.875rem',
    lineHeight: 1.6,
    color: 'var(--fi-color-text)',
    whiteSpace: 'pre-wrap' as const,
  },
  confirmedBanner: {
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: 'var(--fi-radius-md)',
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  pendingBanner: {
    background: 'rgba(224, 169, 109, 0.1)',
    border: '1px solid rgba(224, 169, 109, 0.3)',
    borderRadius: 'var(--fi-radius-md)',
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
} as const;

export default ConfirmRegistrationPage;
