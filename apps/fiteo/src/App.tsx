import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';
import { LoginPage } from './pages/LoginPage';
import { CalendarPage } from './pages/CalendarPage';
import { CoursesPage } from './pages/CoursesPage';
import { ClassDetailPage } from './pages/ClassDetailPage';
import { AppShell } from './components/Layout/AppShell';
import './index.css';

// ---- Route types ----

export type Route =
  | 'calendar'
  | 'courses'
  | 'class-detail'
  | 'login'
  | 'update-password';

const VALID_ROUTES: Route[] = ['calendar', 'courses', 'class-detail', 'login', 'update-password'];

export type Navigate = (to: string) => void;

// ---- Hash-based routing ----

function parseHash(): { route: Route; params: URLSearchParams } {
  const decoded = decodeURIComponent(window.location.hash.replace(/^#\/?/, ''));
  const [routePart, queryPart] = decoded.split('?');
  const route = VALID_ROUTES.includes(routePart as Route) ? (routePart as Route) : 'calendar';
  const params = new URLSearchParams(queryPart ?? '');
  return { route, params };
}

// ---- App ----

export function App() {
  const { session, loading: authLoading, isPasswordRecovery, signOut, updatePassword } = useAuth();
  const [routeState, setRouteState] = useState<{ route: Route; params: URLSearchParams }>(parseHash);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);

  // Sync route when hash changes
  useEffect(() => {
    const onHash = () => setRouteState(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Fetch user role from profiles table
  const fetchRole = useCallback(async () => {
    if (!session?.user?.id) { setIsAdmin(false); setRoleLoading(false); return; }
    setRoleLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    setIsAdmin(data?.role === 'admin' || data?.role === 'associate');
    setRoleLoading(false);
  }, [session?.user?.id]);

  useEffect(() => { fetchRole(); }, [fetchRole]);

  const navigate: Navigate = (to: string) => {
    window.location.hash = to;
    setRouteState(parseHash());
  };

  const { route, params } = routeState;
  const classId = params.get('class_id');
  const courseId = params.get('course_id');

  // Loading splash
  if (authLoading || (session && roleLoading)) {
    return (
      <div className="loading-center" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner-lg" />
        <span>Carregando…</span>
      </div>
    );
  }

  // Password recovery flow
  if (isPasswordRecovery || route === 'update-password') {
    return <UpdatePasswordPage onSuccess={() => navigate('calendar')} updatePassword={updatePassword} />;
  }

  // Login gate
  if (!session) {
    return <LoginPage />;
  }

  const email = session.user?.email ?? '';

  return (
    <AppShell
      route={route}
      navigate={navigate}
      onSignOut={signOut}
      email={email}
      isAdmin={isAdmin}
    >
      {/* Calendar / Agenda */}
      {route === 'calendar' && (
        <CalendarPage
          navigate={navigate}
          isAdmin={isAdmin}
          // If arriving from CoursesPage with a course_id query param, pre-select it
          preselectedCourseId={courseId}
        />
      )}

      {/* Course catalog */}
      {route === 'courses' && (
        <CoursesPage navigate={navigate} />
      )}

      {/* Class detail */}
      {route === 'class-detail' && classId && (
        <ClassDetailPage classId={classId} navigate={navigate} isAdmin={isAdmin} />
      )}
      {route === 'class-detail' && !classId && (
        // Fallback: no class_id in URL → go back to calendar
        <CalendarPage navigate={navigate} isAdmin={isAdmin} />
      )}
    </AppShell>
  );
}

// ---- Update password (inline) ----

function UpdatePasswordPage({
  onSuccess,
  updatePassword,
}: {
  onSuccess: () => void;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
}) {
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
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">📅</div>
          <h1 className="login-title">FITEO</h1>
          <p className="login-sub">Redefinir Senha</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="upd-password">Nova senha</label>
            <input id="upd-password" type="password" className="form-input"
              value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="upd-confirm">Confirmar senha</label>
            <input id="upd-confirm" type="password" className="form-input"
              value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} />
          </div>
          {error && <p className="form-error">⚠ {error}</p>}
          <button id="upd-submit-btn" type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <><span className="spinner" /> Salvando…</> : 'Redefinir Senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
