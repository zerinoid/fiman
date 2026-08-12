import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { TargetsPage } from './pages/TargetsPage';
import { BoletoPage } from './pages/BoletoPage';
import { QuickAddPage } from './pages/QuickAddPage';
import { UpdatePasswordPage } from './pages/UpdatePasswordPage';
import { FiorcValoresPage } from './pages/ValoresPage';
import { AppShell } from './components/Layout/AppShell';
import { formatMonthYear } from './utils/categories';

// ---- Hash-based routing ----

export type Route = 'dashboard' | 'transactions' | 'targets' | 'boleto' | 'add' | 'reset-password' | 'update-password' | 'valores';

const VALID_ROUTES: Route[] = ['dashboard', 'transactions', 'targets', 'boleto', 'add', 'reset-password', 'update-password', 'valores'];

function getRouteFromHash(): Route {
  // 1. If explicit hash is present in URL (e.g. #transactions, #add), honor hash first
  const rawHash = window.location.hash.replace('#', '') as Route;
  if (rawHash && VALID_ROUTES.includes(rawHash)) {
    return rawHash;
  }

  // 2. Otherwise check search params (e.g. ?shortcut=add or ?route=add from PWA launcher)
  const searchParams = new URLSearchParams(window.location.search);
  const shortcutRoute = searchParams.get('shortcut') || searchParams.get('route');
  if (shortcutRoute && VALID_ROUTES.includes(shortcutRoute as Route)) {
    // Clean up query param from URL bar so subsequent hash navigations work cleanly on first click
    const cleanUrl = window.location.pathname + '#' + shortcutRoute;
    window.history.replaceState(null, '', cleanUrl);
    return shortcutRoute as Route;
  }

  return 'dashboard';
}

// ---- Month state shared across pages ----

export interface MonthProps {
  year: number;
  month: number;
  monthLabel: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

function UnauthorizedScreen({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="loading-center" style={{ minHeight: '100vh', padding: 'var(--fi-space-6)' }}>
      <div
        className="card"
        style={{
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center',
          padding: 'var(--fi-space-8)',
          boxShadow: '0 8px 32px hsl(0 0% 0% / 0.5)',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: 'var(--fi-space-4)' }}>🚫</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--fi-space-2)' }}>
          Não autorizado
        </h1>
        <p style={{ color: 'var(--fi-color-text-muted)', fontSize: '0.9rem', marginBottom: 'var(--fi-space-6)' }}>
          Esta aplicação (FIORC) é restrita a administradores. Seu perfil não possui acesso autorizado.
        </p>
        <button className="btn btn-primary w-full" onClick={onSignOut}>
          Sair / Alternar Conta
        </button>
      </div>
    </div>
  );
}

// ---- App ----

export function App() {
  const { session, loading, isPasswordRecovery, signOut } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const [route, setRoute] = useState<Route>(getRouteFromHash);

  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const monthLabel = formatMonthYear(year, month);

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

  const onPrevMonth = useCallback(() => {
    setMonth(m => {
      if (m === 1) {
        setYear(y => y - 1);
        return 12;
      }
      return m - 1;
    });
  }, []);

  const onNextMonth = useCallback(() => {
    setMonth(m => {
      if (m === 12) {
        setYear(y => y + 1);
        return 1;
      }
      return m + 1;
    });
  }, []);

  // Hotkey for active month navigation (spacebar -> next month, shift+spacebar -> prev month)
  useEffect(() => {
    const activeRoutes: Route[] = ['dashboard', 'transactions', 'targets'];
    if (!activeRoutes.includes(route)) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (
            ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName) ||
            target.isContentEditable ||
            target.closest('[role="dialog"]') !== null ||
            target.closest('.modal') !== null
          )
        ) {
          return;
        }

        e.preventDefault();
        if (e.shiftKey) {
          onPrevMonth();
        } else {
          onNextMonth();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [route, onPrevMonth, onNextMonth]);

  // Update route state when browser hash changes (back/forward, nav clicks)
  useEffect(() => {
    const onHash = () => setRoute(getRouteFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (to: Route) => {
    window.location.hash = to;
    setRoute(to);
  };

  if (loading || (session && roleLoading)) {
    return (
      <div className="loading-center" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner-lg" />
        <span>Carregando…</span>
      </div>
    );
  }

  // Handle password reset/recovery views
  if (route === 'reset-password') {
    return <UpdatePasswordPage mode="reset-request" />;
  }

  if (isPasswordRecovery || route === 'update-password') {
    return <UpdatePasswordPage mode="update-password" />;
  }

  if (!session) {
    return <LoginPage />;
  }

  // Unauthorized check for non-admin roles
  if (userRole !== 'admin') {
    return <UnauthorizedScreen onSignOut={signOut} />;
  }

  const monthProps: MonthProps = { year, month, monthLabel, onPrevMonth, onNextMonth };
  const email = session.user?.email ?? '';

  return (
    <AppShell route={route} navigate={navigate} onSignOut={signOut} email={email}>
      {route === 'dashboard'    && <DashboardPage    {...monthProps} />}
      {route === 'transactions' && <TransactionsPage {...monthProps} />}
      {route === 'targets'      && <TargetsPage      {...monthProps} />}
      {route === 'boleto'       && <BoletoPage />}
      {route === 'add'          && <QuickAddPage     {...monthProps} />}
      {route === 'valores'      && <FiorcValoresPage />}
    </AppShell>
  );
}

