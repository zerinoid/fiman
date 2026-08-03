import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { StudentsPage } from './pages/StudentsPage';
import { StudentProfilePage } from './pages/StudentProfilePage';
import { QuickLogPage } from './pages/QuickLogPage';
import { AppShell } from './components/Layout/AppShell';
import './index.css';


// ---- Types ----

export type Route = 'students' | 'profile' | 'log' | 'login' | 'update-password';
export type Navigate = (to: Route) => void;

const VALID_ROUTES: Route[] = ['students', 'profile', 'log', 'login', 'update-password'];

// ---- Hash-based routing ----

/**
 * Parse "#route?key=value" style hashes.
 * Returns { route, params }.
 */
function parseHash(): { route: Route; params: URLSearchParams } {
  const raw = window.location.hash.replace('#', '');
  const [routePart, queryPart] = raw.split('?');
  const route = VALID_ROUTES.includes(routePart as Route) ? (routePart as Route) : 'students';
  const params = new URLSearchParams(queryPart ?? '');
  return { route, params };
}

// ---- App ----

export function App() {
  const { session, loading, isPasswordRecovery, signOut } = useAuth();
  const [routeState, setRouteState] = useState<{ route: Route; params: URLSearchParams }>(parseHash);

  // Sync route state when browser hash changes (back/forward, link clicks)
  useEffect(() => {
    const onHash = () => setRouteState(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate: Navigate = (to: Route) => {
    // Preserve current hash params only if navigating to same route
    window.location.hash = to;
    setRouteState(parseHash());
  };

  const { route, params } = routeState;
  const personId = params.get('person_id');

  // --- Loading splash ---
  if (loading) {
    return (
      <div className="loading-center" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner-lg" />
        <span>Carregando…</span>
      </div>
    );
  }

  // --- Password recovery flow ---
  if (isPasswordRecovery || route === 'update-password') {
    // Minimal update-password page — redirect to login after update
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">
            <div className="login-logo-icon">🎓</div>
            <h1 className="login-title">FIALN</h1>
            <p className="login-sub">Redefinir Senha</p>
          </div>
          <UpdatePasswordForm onSuccess={() => navigate('students')} />
        </div>
      </div>
    );
  }

  // --- Login gate ---
  if (!session) {
    return <LoginPage />;
  }

  const email = session.user?.email ?? '';

  return (
    <AppShell route={route} navigate={navigate} onSignOut={signOut} email={email}>
      {route === 'students' && (
        <StudentsPage navigate={navigate} />
      )}
      {route === 'profile' && personId && (
        <StudentProfilePage personId={personId} navigate={navigate} />
      )}
      {route === 'profile' && !personId && (
        // Fallback if profile route has no person_id
        <StudentsPage navigate={navigate} />
      )}
      {route === 'log' && (
        <QuickLogPage prefilledPersonId={params.get('person_id')} navigate={navigate} />
      )}
    </AppShell>
  );
}

// ---- Inline update-password component ----

function UpdatePasswordForm({ onSuccess }: { onSuccess: () => void }) {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('As senhas não coincidem.'); return; }
    if (password.length < 6) { setError('A senha deve ter ao menos 6 caracteres.'); return; }
    setLoading(true);
    const { error: err } = await updatePassword(password);
    if (err) { setError(err.message); } else { onSuccess(); }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="stack-4">
      <div className="form-group">
        <label className="form-label" htmlFor="upd-password">Nova senha</label>
        <input id="upd-password" type="password" className="form-input" value={password}
          onChange={(e) => setPassword(e.target.value)} required minLength={6} />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="upd-confirm">Confirmar senha</label>
        <input id="upd-confirm" type="password" className="form-input" value={confirm}
          onChange={(e) => setConfirm(e.target.value)} required minLength={6} />
      </div>
      {error && <p className="form-error">{error}</p>}
      <button id="upd-submit-btn" type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? <><span className="spinner" /> Salvando…</> : 'Redefinir Senha'}
      </button>
    </form>
  );
}
