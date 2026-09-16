import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface StudentTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  personId: string;
  studentName: string;
  studentPhone?: string | null;
  termsAcceptedAt?: string | null;
  emailVerifiedAt?: string | null;
}

export function StudentTermsModal({
  isOpen,
  onClose,
  personId,
  studentName,
  studentPhone,
  termsAcceptedAt,
  emailVerifiedAt,
}: StudentTermsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState('');
  const [message, setMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  useEffect(() => {
    if (!isOpen || !personId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setCopiedLink(false);
    setCopiedMsg(false);

    async function generateToken() {
      try {
        const { data: res, error: rpcErr } = await supabase.rpc('generate_student_regularization_token', {
          p_person_id: personId,
        });

        if (rpcErr) throw rpcErr;

        const result = res as { success?: boolean; token?: string; error?: string; first_name?: string } | null;
        if (!result || result.success === false || !result.token) {
          throw new Error(result?.error || 'Erro ao gerar o link.');
        }

        if (cancelled) return;

        const origin = window.location.origin;
        const generatedUrl = `${origin}/#termo?token=${result.token}`;
        setLink(generatedUrl);

        const firstName = result.first_name || studentName.trim().split(' ')[0] || 'aluno(a)';
        const defaultMsg = `Olá, ${firstName}! Tudo bem?\n\nPara mantermos seu cadastro regularizado e formalizarmos a ciência das diretrizes e segurança das aulas de Shibari, por favor confirme seus dados e aceite o termo no link individual abaixo:\n\n${generatedUrl}`;

        setMessage(defaultMsg);
      } catch (err) {
        console.error('[StudentTermsModal] Error generating token:', err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Falha ao gerar link individual.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    generateToken();

    return () => {
      cancelled = true;
    };
  }, [isOpen, personId, studentName]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyMessage = async () => {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message);
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2500);
    } catch {
      // Fallback
    }
  };

  // WhatsApp wa.me URL
  const cleanDigits = studentPhone ? studentPhone.replace(/\D/g, '') : '';
  const fullPhone = cleanDigits.length === 10 || cleanDigits.length === 11 ? `55${cleanDigits}` : cleanDigits;
  const whatsappUrl = fullPhone
    ? `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 250,
        padding: '1rem',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '540px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div className="flex-between mb-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📲</span>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                Link de Aceite do Termo
              </h2>
              <p className="text-xs text-muted" style={{ marginTop: '2px' }}>
                Para envio individual via WhatsApp
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        {/* Student identification */}
        <div
          style={{
            background: 'var(--fi-color-surface-2)',
            border: '1px solid var(--fi-color-border)',
            borderRadius: 'var(--fi-radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--fi-color-text)' }}>
              {studentName}
            </div>
            {studentPhone && (
              <div style={{ fontSize: '0.8rem', color: 'var(--fi-color-text-muted)' }}>
                WhatsApp: {studentPhone}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            {termsAcceptedAt ? (
              <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                ✓ Termo assinado
              </span>
            ) : (
              <span className="badge badge-warning" style={{ fontSize: '0.72rem' }}>
                ⏳ Termo pendente
              </span>
            )}
            {emailVerifiedAt && (
              <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                ✉️ E-mail verificado
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div className="spinner spinner-lg" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ color: 'var(--fi-color-text-muted)', fontSize: '0.85rem' }}>
              Gerando link individual com validade de 30 dias…
            </p>
          </div>
        ) : error ? (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--fi-color-danger)', borderRadius: 'var(--fi-radius-md)' }}>
            ⚠️ {error}
          </div>
        ) : (
          <div className="stack-4">
            {/* Direct Link Section */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Link Individual de Regularização</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--fi-color-text-muted)' }}>
                  Validade: 30 dias
                </span>
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  readOnly
                  className="form-input text-mono"
                  style={{ fontSize: '0.82rem' }}
                  value={link}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  type="button"
                  className={`btn ${copiedLink ? 'btn-success' : 'btn-secondary'}`}
                  style={{ flexShrink: 0, minWidth: '105px' }}
                  onClick={handleCopyLink}
                >
                  {copiedLink ? '✓ Copiado!' : 'Copiar Link'}
                </button>
              </div>
            </div>

            {/* Pre-written Message Section */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Mensagem Pronta para WhatsApp</span>
              </label>
              <textarea
                className="form-input"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ fontSize: '0.85rem', lineHeight: 1.5 }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '0.5rem' }}>
              <button
                type="button"
                className={`btn ${copiedMsg ? 'btn-success' : 'btn-secondary'}`}
                style={{ flex: 1, minWidth: '150px' }}
                onClick={handleCopyMessage}
              >
                {copiedMsg ? '✓ Mensagem Copiada!' : '📋 Copiar Mensagem'}
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{
                  flex: 1,
                  minWidth: '170px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  background: '#25D366',
                  borderColor: '#25D366',
                  color: '#ffffff',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <span>💬 Abrir no WhatsApp</span>
              </a>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--fi-color-text-muted)', lineHeight: 1.5, textAlign: 'center', paddingTop: '0.5rem' }}>
              Ao abrir o link, o aluno verá seus dados já preenchidos, poderá confirmar o e-mail e assinará digitalmente o termo com registro de IP e carimbo de data/hora.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentTermsModal;
