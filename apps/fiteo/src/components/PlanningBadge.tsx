interface PlanningBadgeProps {
  isPlanned: boolean;
}

export function PlanningBadge({ isPlanned }: PlanningBadgeProps) {
  return (
    <span className={`planning-badge ${isPlanned ? 'planned' : 'unplanned'}`}>
      {isPlanned ? '✓ Planejada' : '⚠ Não planejada'}
    </span>
  );
}
