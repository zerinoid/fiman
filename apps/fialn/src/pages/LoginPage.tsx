import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { signInWithPassword, signInWithOtp, resetPasswordForEmail } = useAuth();

  const [mode, setMode] = useState<'password' | 'otp' | 'reset'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === 'password') {
        const { error } = await signInWithPassword(email, password);
        if (error) setErrorMsg(error.message);
      } else if (mode === 'otp') {
        const { error } = await signInWithOtp(email);
        if (error) setErrorMsg(error.message);
        else setSuccessMsg('Link mágico enviado! Verifique seu e-mail.');
      } else {
        const { error } = await resetPasswordForEmail(email);
        if (error) setErrorMsg(error.message);
        else setSuccessMsg('E-mail de recuperação enviado!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">🎓</div>
          <h1 className="login-title">FIALN</h1>
          <p className="login-sub">Acompanhamento de Alunos</p>
        </div>

        {successMsg && (
          <div className="alert alert-success mb-6">{successMsg}</div>
        )}

        <form id="login-form" onSubmit={handleSubmit} className="stack-4">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          {mode === 'password' && (
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Senha</label>
              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          {errorMsg && (
            <p className="form-error">{errorMsg}</p>
          )}

          <button
            id="login-submit-btn"
            type="submit"
            className="btn btn-primary"
            style={{ height: '3rem', marginTop: 'var(--fi-space-2)' }}
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> Entrando…</> :
              mode === 'password' ? 'Entrar' :
              mode === 'otp' ? 'Enviar Link Mágico' :
              'Enviar Link de Recuperação'
            }
          </button>
        </form>

        <div className="stack-4 mt-6" style={{ borderTop: '1px solid var(--fi-color-border)', paddingTop: 'var(--fi-space-4)' }}>
          {mode !== 'password' && (
            <button
              id="login-mode-password"
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => { setMode('password'); setErrorMsg(null); setSuccessMsg(null); }}
            >
              ← Entrar com senha
            </button>
          )}
          {mode !== 'otp' && (
            <button
              id="login-mode-otp"
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => { setMode('otp'); setErrorMsg(null); setSuccessMsg(null); }}
            >
              Entrar com link mágico (e-mail)
            </button>
          )}
          {mode !== 'reset' && (
            <button
              id="login-mode-reset"
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => { setMode('reset'); setErrorMsg(null); setSuccessMsg(null); }}
            >
              Esqueci minha senha
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
