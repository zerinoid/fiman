import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { signInWithOtp, signInWithPassword } = useAuth();
  const [mode, setMode]       = useState<'password' | 'otp'>('password');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === 'password') {
      const { error: signInErr } = await signInWithPassword(email.trim(), password);
      setLoading(false);
      if (signInErr) {
        setError('E-mail ou senha incorretos. Verifique suas credenciais.');
      }
    } else {
      const { error: signInErr } = await signInWithOtp(email.trim());
      setLoading(false);
      if (signInErr) {
        setError('E-mail não encontrado. Verifique com o administrador.');
      } else {
        setSent(true);
      }
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
          marginBottom: '1.5rem',
        }}>
          Orçamento Pessoal &amp; Fluxo de Caixa
        </p>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📬</div>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Verifique seu e-mail</p>
            <p style={{ color: 'var(--fi-color-text-muted)', fontSize: '0.875rem' }}>
              Enviamos um link de acesso para <strong>{email}</strong>.<br />
              Clique no link para entrar.
            </p>
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginTop: '1.5rem' }}
              onClick={() => { setSent(false); setEmail(''); }}
            >
              Tentar outro e-mail
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" htmlFor="login-email">
                Endereço de e-mail
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

            {mode === 'password' && (
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" htmlFor="login-password">
                  Senha
                </label>
                <input
                  id="login-password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            )}

            {error && <p className="form-error" style={{ marginBottom: '1rem' }}>{error}</p>}

            <button
              id="btn-login-submit"
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading || !email.trim() || (mode === 'password' && !password)}
            >
              {loading ? (
                <><span className="spinner" /> {mode === 'password' ? 'Entrando…' : 'Enviando…'}</>
              ) : (
                mode === 'password' ? 'Entrar' : 'Enviar link de acesso'
              )}
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setMode(m => m === 'password' ? 'otp' : 'password');
                  setError(null);
                }}
                style={{ fontSize: '0.85rem', color: 'var(--fi-color-text-muted)' }}
              >
                {mode === 'password' ? '✨ Entrar com Link Mágico' : '🔑 Entrar com Senha'}
              </button>

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => window.location.hash = 'reset-password'}
                style={{ fontSize: '0.8rem', color: 'var(--fi-color-text-muted)' }}
              >
                Criar ou redefinir senha
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
