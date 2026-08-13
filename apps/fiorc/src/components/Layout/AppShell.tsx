import type { ReactNode } from 'react';
import type { Route } from '../../App';
import { NavItem } from './NavItem';

interface AppShellProps {
  route: Route;
  navigate: (to: Route) => void;
  onSignOut: () => void;
  email: string;
  children: ReactNode;
}

const NAV_ITEMS: { icon: string; label: string; route: Route; shortcut: string }[] = [
  { icon: '🏠', label: 'Dashboard',   route: 'dashboard',    shortcut: '1' },
  { icon: '💸', label: 'Transações',  route: 'transactions', shortcut: '2' },
  { icon: '🎯', label: 'Metas',       route: 'targets',      shortcut: '3' },
  { icon: '📄', label: 'Boleto',      route: 'boleto',       shortcut: '4' },
  { icon: '💰', label: 'Valores',     route: 'valores',      shortcut: '5' },
];

export function AppShell({ route, navigate, onSignOut, email, children }: AppShellProps) {
  const avatarChar = email?.[0]?.toUpperCase() ?? '?';

  return (
    <>
      <div className="app-shell">
        {/* ─── Desktop Sidebar ─────────────────────── */}
        <aside className="sidebar" aria-label="Navegação principal">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">💰</div>
            <span className="sidebar-logo-text">FIORC</span>
          </div>

          <span className="sidebar-section-label">Menu</span>

          {NAV_ITEMS.map(item => (
            <NavItem key={item.route} {...item} current={route} navigate={navigate} />
          ))}

          <div className="sidebar-spacer" />

          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{avatarChar}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-email">{email}</div>
            </div>
            <button
              id="btn-sign-out"
              className="btn btn-ghost btn-sm btn-icon"
              onClick={onSignOut}
              title="Sair"
              style={{ flexShrink: 0 }}
            >
              ↩
            </button>
          </div>
        </aside>

        {/* ─── Main Content ─────────────────────────── */}
        <main className="main-content" id="main-content">
          {children}
        </main>
      </div>

      {/* ─── Mobile Bottom Nav ────────────────────── */}
      <nav className="bottom-nav" aria-label="Navegação mobile">
        {NAV_ITEMS.map(item => (
          <button
            key={item.route}
            id={`bottom-nav-${item.route}`}
            className={`bottom-nav-item${route === item.route ? ' active' : ''}`}
            onClick={() => navigate(item.route)}
          >
            <span className="bottom-nav-item-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </>
  );
}
