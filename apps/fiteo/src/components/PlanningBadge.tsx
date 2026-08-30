interface PlanningBadgeProps {
  isPlanned: boolean;
  isPast?: boolean;
  isCancelled?: boolean;
  compact?: boolean;
}

export function PlanningBadge({ isPlanned, isPast, isCancelled, compact }: PlanningBadgeProps) {
  if (isCancelled) {
    return (
      <span
        className={`planning-badge planning-badge-cancelled ${compact ? 'planning-badge-compact' : ''}`}
        title="Aula Cancelada"
        style={{
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          color: '#fca5a5',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          fontSize: compact ? '0.68rem' : '0.72rem',
          fontWeight: 600,
          padding: compact ? '1px 6px' : '2px 8px',
          borderRadius: '12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
          whiteSpace: 'nowrap',
        }}
      >
        <span>✕</span>
        <span>{compact ? 'Canc.' : 'Cancelada'}</span>
      </span>
    );
  }

  if (isPast) {
    return (
      <span
        className={`planning-badge planning-badge-past ${compact ? 'compact' : ''}`}
        title="Aula já Ministrada"
        style={{
          backgroundColor: '#14532d',
          color: '#86efac',
          border: '1px solid #166534',
          fontSize: compact ? '0.68rem' : '0.72rem',
          fontWeight: 600,
          padding: compact ? '1px 6px' : '2px 8px',
          borderRadius: '12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
          whiteSpace: 'nowrap',
        }}
      >
        <span>✓</span>
        <span>{compact ? 'Feita' : 'Ministrada'}</span>
      </span>
    );
  }

  return (
    <span
      className={`planning-badge ${isPlanned ? 'planning-badge-planned' : 'planning-badge-unplanned'} ${compact ? 'compact' : ''}`}
      title={isPlanned ? 'Aula Planejada' : 'Aula Não Planejada'}
      style={{
        backgroundColor: isPlanned ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.15)',
        color: isPlanned ? '#60a5fa' : '#fca5a5',
        border: isPlanned ? '1px solid rgba(96, 165, 250, 0.4)' : '1px solid rgba(239, 68, 68, 0.3)',
        fontSize: compact ? '0.68rem' : '0.72rem',
        fontWeight: 600,
        padding: compact ? '1px 6px' : '2px 8px',
        borderRadius: '12px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        whiteSpace: 'nowrap',
      }}
    >
      <span>{isPlanned ? '📅' : '⚠'}</span>
      <span>{isPlanned ? (compact ? 'Plan.' : 'Planejada') : (compact ? 'Pendente' : 'Não planejada')}</span>
    </span>
  );
}
