import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { signInWithPassword, resetPasswordForEmail } = useAuth();
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await signInWithPassword(email, password);
    if (err) setError(err.message);
    setLoading(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await resetPasswordForEmail(email);
    if (err) { setError(err.message); } else { setResetSent(true); }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">📅</div>
          <h1 className="login-title">FITEO</h1>
          <p className="login-sub">Aulas & Grupos de Estudo</p>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">E-mail</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Senha</label>
              <input
                id="login-password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && <p className="form-error">⚠ {error}</p>}

            <button id="login-submit-btn" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Entrando…</> : 'Entrar'}
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ alignSelf: 'center' }}
              onClick={() => { setMode('reset'); setError(null); }}
            >
              Esqueci a senha
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="login-form">
            {resetSent ? (
              <div className="alert alert-success">
                Link de redefinição enviado! Verifique seu e-mail.
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="reset-email">E-mail</label>
                  <input
                    id="reset-email"
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                {error && <p className="form-error">⚠ {error}</p>}

                <button id="reset-submit-btn" type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <><span className="spinner" /> Enviando…</> : 'Enviar link'}
                </button>
              </>
            )}

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ alignSelf: 'center' }}
              onClick={() => { setMode('login'); setError(null); setResetSent(false); }}
            >
              ← Voltar ao login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
