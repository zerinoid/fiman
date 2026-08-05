interface PlanningBadgeProps {
  isPlanned: boolean;
  isPast?: boolean;
}

export function PlanningBadge({ isPlanned, isPast }: PlanningBadgeProps) {
  if (isPast) {
    return (
      <span
        className="planning-badge"
        style={{
          backgroundColor: '#14532d',
          color: '#86efac',
          border: '1px solid #166534',
          fontSize: '0.72rem',
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: '12px',
        }}
      >
        ✓ Ministrada
      </span>
    );
  }

  return (
    <span
      className="planning-badge"
      style={{
        backgroundColor: isPlanned ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.15)',
        color: isPlanned ? '#60a5fa' : '#fca5a5',
        border: isPlanned ? '1px solid rgba(96, 165, 250, 0.4)' : '1px solid rgba(239, 68, 68, 0.3)',
        fontSize: '0.72rem',
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: '12px',
      }}
    >
      {isPlanned ? '📅 Planejada' : '⚠ Não planejada'}
    </span>
  );
}
