import type { Route } from '../../App';

interface NavItemProps {
  icon: string;
  label: string;
  route: Route;
  shortcut?: string;
  current: Route;
  navigate: (to: Route) => void;
}

export function NavItem({ icon, label, route, shortcut, current, navigate }: NavItemProps) {
  const active = route === current;
  return (
    <button
      id={`nav-${route}`}
      className={`nav-item${active ? ' active' : ''}`}
      onClick={() => navigate(route)}
      aria-current={active ? 'page' : undefined}
      title={shortcut ? `${label} (Atalho: ${shortcut})` : label}
    >
      <span className="nav-item-icon">{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {shortcut && (
        <span
          style={{
            fontSize: '0.7rem',
            opacity: 0.5,
            padding: '2px 5px',
            borderRadius: '4px',
            border: '1px solid currentColor',
            lineHeight: 1,
            marginLeft: '4px',
          }}
        >
          {shortcut}
        </span>
      )}
    </button>
  );
}
