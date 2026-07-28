import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface UpdatePasswordPageProps {
  mode?: 'reset-request' | 'update-password';
}

export function UpdatePasswordPage({ mode = 'update-password' }: UpdatePasswordPageProps) {
  const { updatePassword, resetPasswordForEmail } = useAuth();
  
  // State for request mode
  const [email, setEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // State for update mode
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: resetErr } = await resetPasswordForEmail(email.trim());
    setLoading(false);

    if (resetErr) {
      setError(resetErr.message || 'Erro ao enviar e-mail de redefinição.');
    } else {
      setResetSent(true);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: updateErr } = await updatePassword(password);
    setLoading(false);

    if (updateErr) {
      setError(updateErr.message || 'Erro ao redefinir a senha.');
    } else {
      setSuccess(true);
      setTimeout(() => {
        window.location.hash = 'dashboard';
      }, 1500);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🔑</div>

        <h1 style={{
          fontSize: '1.6rem',
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: '0.25rem',
        }}>
          {mode === 'reset-request' ? 'Redefinir Senha' : 'Nova Senha'}
        </h1>
        <p style={{
          textAlign: 'center',
          color: 'var(--fi-color-text-muted)',
          fontSize: '0.875rem',
          marginBottom: '1.5rem',
        }}>
          {mode === 'reset-request'
            ? 'Informe seu e-mail para receber o link de redefinição'
            : 'Crie uma nova senha para acessar sua conta'}
        </p>

        {mode === 'reset-request' ? (
          resetSent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📩</div>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>E-mail enviado!</p>
              <p style={{ color: 'var(--fi-color-text-muted)', fontSize: '0.875rem' }}>
                Enviamos o link para criar sua senha para <strong>{email}</strong>.<br />
                Verifique sua caixa de entrada e clique no link recebido.
              </p>
              <button
                className="btn btn-ghost btn-sm"
                style={{ marginTop: '1.5rem' }}
                onClick={() => window.location.hash = 'dashboard'}
              >
                Voltar para o Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleRequestReset}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" htmlFor="reset-email">
                  E-mail cadastrado
                </label>
                <input
                  id="reset-email"
                  type="email"
                  className="form-input"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {error && <p className="form-error" style={{ marginBottom: '1rem' }}>{error}</p>}

              <button
                type="submit"
                className="btn btn-primary btn-lg w-full"
                disabled={loading || !email.trim()}
              >
                {loading ? <><span className="spinner" /> Enviando…</> : 'Enviar link para redefinir senha'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => window.location.hash = 'dashboard'}
                  style={{ fontSize: '0.85rem' }}
                >
                  ← Voltar para o Login
                </button>
              </div>
            </form>
          )
        ) : (
          success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Senha atualizada com sucesso!</p>
              <p style={{ color: 'var(--fi-color-text-muted)', fontSize: '0.875rem' }}>
                Redirecionando para o sistema…
              </p>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" htmlFor="new-password">
                  Nova Senha (mínimo 6 caracteres)
                </label>
                <input
                  id="new-password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoFocus
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" htmlFor="confirm-password">
                  Confirmar Nova Senha
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {error && <p className="form-error" style={{ marginBottom: '1rem' }}>{error}</p>}

              <button
                type="submit"
                className="btn btn-primary btn-lg w-full"
                disabled={loading || !password || !confirmPassword}
              >
                {loading ? <><span className="spinner" /> Salvando…</> : 'Salvar Nova Senha'}
              </button>
            </form>
          )
        )}
      </div>
    </div>
  );
}
