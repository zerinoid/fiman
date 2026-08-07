import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';

function UnauthorizedScreen({ onSignOut }: { onSignOut: () => void }) {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--fi-space-8)',
      }}
    >
      <div
        style={{
          background: 'var(--fi-color-surface)',
          border: '1px solid var(--fi-color-border)',
          borderRadius: 'var(--fi-radius-xl)',
          padding: 'var(--fi-space-8)',
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 8px 32px hsl(0 0% 0% / 0.5)',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: 'var(--fi-space-4)' }}>🚫</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--fi-space-2)' }}>
          Não autorizado
        </h1>
        <p style={{ color: 'var(--fi-color-text-muted)', fontSize: '0.9rem', marginBottom: 'var(--fi-space-6)' }}>
          Esta aplicação (FIATT) é restrita a administradores. Seu perfil não possui acesso autorizado.
        </p>
        <button
          onClick={onSignOut}
          style={{
            width: '100%',
            padding: 'var(--fi-space-3)',
            background: 'var(--fi-color-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--fi-radius-md)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Sair / Alternar Conta
        </button>
      </div>
    </main>
  );
}

function FiattLoginPage({ onLogin }: { onLogin: (e: string, p: string) => Promise<boolean> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const ok = await onLogin(email.trim(), password);
    setSubmitting(false);
    if (!ok) {
      setError('E-mail ou senha incorretos. Verifique suas credenciais.');
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--fi-space-8)',
      }}
    >
      <div
        style={{
          background: 'var(--fi-color-surface)',
          border: '1px solid var(--fi-color-border)',
          borderRadius: 'var(--fi-radius-xl)',
          padding: 'var(--fi-space-8)',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 8px 32px hsl(0 0% 0% / 0.5)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🫀</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>FIATT</h1>
          <p style={{ color: 'var(--fi-color-text-muted)', fontSize: '0.85rem' }}>
            Sessões de Clientes &amp; Anamnese
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.6rem',
                borderRadius: 'var(--fi-radius-md)',
                border: '1px solid var(--fi-color-border)',
                background: 'var(--fi-color-surface-2)',
                color: 'var(--fi-color-text)',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.6rem',
                borderRadius: 'var(--fi-radius-md)',
                border: '1px solid var(--fi-color-border)',
                background: 'var(--fi-color-surface-2)',
                color: 'var(--fi-color-text)',
              }}
            />
          </div>

          {error && (
            <p style={{ color: 'var(--fi-color-danger)', fontSize: '0.85rem', margin: 0 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '0.75rem',
              background: 'var(--fi-color-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--fi-radius-md)',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '0.5rem',
            }}
          >
            {submitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  );
}

export function App() {
  const { session, loading: authLoading, signInWithPassword, signOut } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const fetchRole = useCallback(async () => {
    if (!session?.user?.id) {
      setUserRole(null);
      setRoleLoading(false);
      return;
    }
    setRoleLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    setUserRole(data?.role ?? null);
    setRoleLoading(false);
  }, [session?.user?.id]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  if (authLoading || (session && roleLoading)) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span>Carregando…</span>
      </div>
    );
  }

  if (!session) {
    return (
      <FiattLoginPage
        onLogin={async (email, pass) => {
          const { error } = await signInWithPassword(email, pass);
          return !error;
        }}
      />
    );
  }

  if (userRole !== 'admin') {
    return <UnauthorizedScreen onSignOut={signOut} />;
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--fi-space-4)',
        padding: 'var(--fi-space-8)',
      }}
    >
      <div
        style={{
          background: 'var(--fi-color-surface)',
          border: '1px solid var(--fi-color-border)',
          borderRadius: 'var(--fi-radius-xl)',
          padding: 'var(--fi-space-8)',
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 8px 32px hsl(0 0% 0% / 0.5)',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--fi-radius-lg)',
            background: 'hsl(var(--fi-hue-primary), 60%, 68%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            margin: '0 auto var(--fi-space-6)',
          }}
        >
          🫀
        </div>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            marginBottom: 'var(--fi-space-2)',
            color: 'var(--fi-color-text)',
          }}
        >
          FIATT
        </h1>
        <p style={{ color: 'var(--fi-color-text-muted)', fontSize: '0.95rem' }}>
          Sessões de Clientes &amp; Anamnese
        </p>
        <div
          style={{
            marginTop: 'var(--fi-space-6)',
            padding: 'var(--fi-space-3) var(--fi-space-4)',
            background: 'var(--fi-color-surface-2)',
            borderRadius: 'var(--fi-radius-md)',
            fontSize: '0.8rem',
            color: 'var(--fi-color-accent)',
            fontFamily: 'var(--fi-font-mono)',
          }}
        >
          PRD 00 ✓ — Aguardando PRD 04 (FIATT)
        </div>

        <button
          onClick={signOut}
          style={{
            marginTop: '1.5rem',
            padding: '0.5rem 1rem',
            background: 'transparent',
            border: '1px solid var(--fi-color-border)',
            borderRadius: 'var(--fi-radius-md)',
            color: 'var(--fi-color-text-muted)',
            cursor: 'pointer',
          }}
        >
          Sair ({session.user.email})
        </button>
      </div>
    </main>
  );
}
