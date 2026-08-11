import type { Route } from '../../App';

interface NavItem {
  route: Route;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { route: 'students', icon: '🎓', label: 'Alunos' },
  { route: 'log',      icon: '✏️', label: 'Registrar Aula' },
  { route: 'valores',  icon: '💰', label: 'Valores' },
];

interface AppShellProps {
  route: Route;
  navigate: (to: Route) => void;
  onSignOut: () => void;
  email: string;
  children: React.ReactNode;
}

export function AppShell({ route, navigate, onSignOut, email, children }: AppShellProps) {
  const avatarInitial = email.charAt(0).toUpperCase();

  return (
    <div className="app-shell">
      {/* ---- Desktop Sidebar ---- */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">🎓</div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">FIALN</span>
            <span className="sidebar-brand-sub">Acompanhamento</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.route}
              id={`nav-${item.route}`}
              className={`nav-item ${route === item.route || (route === 'profile' && item.route === 'students') ? 'active' : ''}`}
              onClick={() => navigate(item.route)}
            >
              <span className="nav-item-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{avatarInitial}</div>
            <span className="sidebar-email" title={email}>{email}</span>
          </div>
          <button id="sign-out-btn" className="btn btn-ghost btn-sm" onClick={onSignOut}>
            Sair
          </button>
        </div>
      </aside>

      {/* ---- Main Content ---- */}
      <main className="main-content">
        {children}
      </main>

      {/* ---- Mobile Bottom Nav ---- */}
      <nav className="bottom-nav">
        <div className="bottom-nav-items">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.route}
              className={`bottom-nav-item ${route === item.route || (route === 'profile' && item.route === 'students') ? 'active' : ''}`}
              onClick={() => navigate(item.route)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
          <button className="bottom-nav-item" onClick={onSignOut}>
            <span className="nav-icon">🚪</span>
            Sair
          </button>
        </div>
      </nav>
    </div>
  );
}
