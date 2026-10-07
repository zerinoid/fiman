import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';
import { useFiattRecords, FiattClientRecord } from './hooks/useFiattRecords';
import { RecordList } from './components/RecordList';
import { RecordDetails } from './components/RecordDetails';
import { SessionReportForm } from './components/SessionReportForm';
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

  // Estado do Dashboard
  const { records, loading: recordsLoading } = useFiattRecords();
  const [selectedRecord, setSelectedRecord] = useState<FiattClientRecord | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = a.people?.full_name?.toLowerCase() || '';
        const nameB = b.people?.full_name?.toLowerCase() || '';
        return nameA.localeCompare(nameB, 'pt-BR');
      }
      // Padrão: data de submissão decrescente (mais recente primeiro)
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
  }, [records, sortBy]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedRecord(null);
      }
    };
    if (selectedRecord) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedRecord]);

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
        padding: 'var(--fi-space-6)',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '8px',
            background: 'hsl(var(--fi-hue-primary), 60%, 68%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem'
          }}>🫀</div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--fi-color-text)' }}>FIATT Backoffice</h1>
        </div>
        <button
          onClick={signOut}
          style={{
            padding: '0.5rem 1rem', background: 'transparent',
            border: '1px solid var(--fi-color-border)', borderRadius: 'var(--fi-radius-md)',
            color: 'var(--fi-color-text-muted)', cursor: 'pointer',
          }}
        >
          Sair
        </button>
      </header>

      {/* Toolbar com Alternador de Visualização e Ordenação */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem',
        padding: '0.75rem 1rem', background: 'var(--fi-color-surface)',
        border: '1px solid var(--fi-color-border)', borderRadius: 'var(--fi-radius-lg)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--fi-color-text-muted)' }}>
          <span>Total: <strong>{records.length}</strong> {records.length === 1 ? 'ficha' : 'fichas'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Ordenação */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--fi-color-text-muted)' }}>Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
              style={{
                background: 'var(--fi-color-surface-2)',
                color: 'var(--fi-color-text)',
                border: '1px solid var(--fi-color-border)',
                borderRadius: 'var(--fi-radius-md)',
                padding: '0.4rem 0.75rem',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <option value="date">Data de envio (Recentes)</option>
              <option value="name">Nome (A - Z)</option>
            </select>
          </div>

          {/* Toggle de Modo de Exibição */}
          <div style={{
            display: 'inline-flex',
            background: 'var(--fi-color-surface-2)',
            borderRadius: 'var(--fi-radius-md)',
            padding: '2px',
            border: '1px solid var(--fi-color-border)'
          }}>
            <button
              onClick={() => setViewMode('cards')}
              style={{
                padding: '0.4rem 0.8rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: 'calc(var(--fi-radius-md) - 2px)',
                cursor: 'pointer',
                background: viewMode === 'cards' ? 'var(--fi-color-primary)' : 'transparent',
                color: viewMode === 'cards' ? '#fff' : 'var(--fi-color-text-muted)',
                transition: 'all 0.15s ease'
              }}
            >
              🗂️ Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '0.4rem 0.8rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: 'calc(var(--fi-radius-md) - 2px)',
                cursor: 'pointer',
                background: viewMode === 'table' ? 'var(--fi-color-primary)' : 'transparent',
                color: viewMode === 'table' ? '#fff' : 'var(--fi-color-text-muted)',
                transition: 'all 0.15s ease'
              }}
            >
              📋 Lista
            </button>
          </div>
        </div>
      </div>

      {recordsLoading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--fi-color-text-muted)' }}>Carregando fichas...</div>
      ) : (
        <RecordList records={sortedRecords} onSelect={setSelectedRecord} viewMode={viewMode} />
      )}

      {selectedRecord && (
        <div
          onClick={() => setSelectedRecord(null)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', justifyContent: 'flex-end',
            cursor: 'pointer'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '600px', background: 'var(--fi-color-surface)',
              height: '100%', overflowY: 'auto', padding: '2rem',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.5)',
              borderLeft: '1px solid var(--fi-color-border)',
              cursor: 'default'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>{selectedRecord.people?.full_name}</h2>
              <button 
                onClick={() => setSelectedRecord(null)}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}
              >×</button>
            </div>
            
            <div style={{ marginBottom: '2rem' }}>
              <RecordDetails record={selectedRecord} />
            </div>

            <hr style={{ borderColor: 'var(--fi-color-border)', margin: '2rem 0' }} />
            
            <SessionReportForm record={selectedRecord} />
          </div>
        </div>
      )}
    </main>
  );
}
