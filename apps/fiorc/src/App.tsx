import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { TargetsPage } from './pages/TargetsPage';
import { BoletoPage } from './pages/BoletoPage';
import { QuickAddPage } from './pages/QuickAddPage';
import { UpdatePasswordPage } from './pages/UpdatePasswordPage';
import { AppShell } from './components/Layout/AppShell';
import { formatMonthYear } from './utils/categories';

// ---- Hash-based routing ----

export type Route = 'dashboard' | 'transactions' | 'targets' | 'boleto' | 'add' | 'reset-password' | 'update-password';

const VALID_ROUTES: Route[] = ['dashboard', 'transactions', 'targets', 'boleto', 'add', 'reset-password', 'update-password'];

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

// ---- App ----

export function App() {
  const { session, loading, isPasswordRecovery, signOut } = useAuth();

  const [route, setRoute] = useState<Route>(getRouteFromHash);

  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const monthLabel = formatMonthYear(year, month);

  const onPrevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };

  const onNextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  // Update route state when browser hash changes (back/forward, nav clicks)
  useEffect(() => {
    const onHash = () => setRoute(getRouteFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (to: Route) => {
    window.location.hash = to;
    // hashchange fires synchronously in the same task, so setRoute will be
    // called by the listener. Setting it here prevents a frame of stale UI.
    setRoute(to);
  };

  if (loading) {
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

  const monthProps: MonthProps = { year, month, monthLabel, onPrevMonth, onNextMonth };
  const email = session.user?.email ?? '';

  return (
    <AppShell route={route} navigate={navigate} onSignOut={signOut} email={email}>
      {route === 'dashboard'    && <DashboardPage    {...monthProps} />}
      {route === 'transactions' && <TransactionsPage {...monthProps} />}
      {route === 'targets'      && <TargetsPage      {...monthProps} />}
      {route === 'boleto'       && <BoletoPage />}
      {route === 'add'          && <QuickAddPage     {...monthProps} />}
    </AppShell>
  );
}
