import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { signInWithOtp } = useAuth();
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInErr } = await signInWithOtp(email.trim());
    setLoading(false);

    if (signInErr) {
      // Supabase returns an error when user doesn't exist (shouldCreateUser: false)
      setError('Email não encontrado. Verifique com o administrador.');
    } else {
      setSent(true);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">💰</div>

        <h1 style={{
          fontSize: '1.6rem',
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: '0.25rem',
        }}>
          FIORC
        </h1>
        <p style={{
          textAlign: 'center',
          color: 'var(--fi-color-text-muted)',
          fontSize: '0.875rem',
          marginBottom: '2rem',
        }}>
          Orçamento Pessoal &amp; Fluxo de Caixa
        </p>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📬</div>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Verifique seu email</p>
            <p style={{ color: 'var(--fi-color-text-muted)', fontSize: '0.875rem' }}>
              Enviamos um link de acesso para <strong>{email}</strong>.<br />
              Clique no link para entrar.
            </p>
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginTop: '1.5rem' }}
              onClick={() => { setSent(false); setEmail(''); }}
            >
              Tentar outro email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" htmlFor="login-email">
                Endereço de email
              </label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            {error && <p className="form-error" style={{ marginBottom: '1rem' }}>{error}</p>}

            <button
              id="btn-login-submit"
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading || !email.trim()}
            >
              {loading ? <><span className="spinner" /> Enviando…</> : 'Enviar link de acesso'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
