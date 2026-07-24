import type { Route } from '../../App';

interface NavItemProps {
  icon: string;
  label: string;
  route: Route;
  current: Route;
  navigate: (to: Route) => void;
}

export function NavItem({ icon, label, route, current, navigate }: NavItemProps) {
  const active = route === current;
  return (
    <button
      id={`nav-${route}`}
      className={`nav-item${active ? ' active' : ''}`}
      onClick={() => navigate(route)}
      aria-current={active ? 'page' : undefined}
    >
      <span className="nav-item-icon">{icon}</span>
      {label}
    </button>
  );
}
