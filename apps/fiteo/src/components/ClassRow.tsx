import type { ClassSchedule } from '@fi/types';
import { PlanningBadge } from './PlanningBadge';

const MONTH_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

interface ClassRowProps {
  schedule: ClassSchedule;
  onClick: () => void;
}

const COURSE_THEMES: Record<string, { border: string; bg: string; badgeBg: string; text: string }> = {
  'Sobre Nós': {
    border: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.06)',
    badgeBg: 'rgba(168, 85, 247, 0.2)',
    text: '#d8b4fe',
  },
  'Teoria das Cordas': {
    border: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.06)',
    badgeBg: 'rgba(6, 182, 212, 0.2)',
    text: '#67e8f9',
  },
};
const DEFAULT_THEME = {
  border: '#64748b',
  bg: 'rgba(100, 116, 139, 0.06)',
  badgeBg: 'rgba(100, 116, 139, 0.2)',
  text: '#cbd5e1',
};

export function ClassRow({ schedule, onClick }: ClassRowProps) {
  const date = new Date(schedule.class_date);
  const day = date.getDate().toString().padStart(2, '0');
  const month = MONTH_SHORT[date.getMonth()];
  const isPast = date.getTime() < Date.now();
  const isPlannedEffective = schedule.is_planned || isPast;

  const trackTitle = schedule.course?.title ?? '';
  const trackTheme = COURSE_THEMES[trackTitle] ?? DEFAULT_THEME;

  const getCardStyle = (): React.CSSProperties => {
    if (schedule.is_cancelled) {
      return {
        borderLeft: `4px solid ${trackTheme.border}`,
        opacity: 0.6,
        backgroundColor: 'rgba(10, 10, 14, 0.95)',
      };
    }

    if (schedule.is_highlighted) {
      return {
        border: '1px solid rgba(234, 179, 8, 0.4)',
        borderLeft: '5px solid #facc15',
        backgroundColor: 'rgba(234, 179, 8, 0.07)',
        boxShadow: '0 0 12px rgba(234, 179, 8, 0.12)',
        opacity: 1,
      };
    }

    if (isPast) {
      return {
        borderLeft: `4px solid ${trackTheme.border}`,
        opacity: 0.8,
        backgroundColor: 'rgba(18, 18, 24, 0.6)',
      };
    }

    return {
      borderLeft: `4px solid ${trackTheme.border}`,
      backgroundColor: trackTheme.bg,
      opacity: 1,
      boxShadow: `0 2px 8px ${trackTheme.bg}`,
    };
  };

  return (
    <div
      className={`class-row ${schedule.is_highlighted ? 'highlighted-class' : ''} ${isPast ? 'past-class' : 'future-class'}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      id={`class-row-${schedule.id}`}
      style={getCardStyle()}
    >
      <div className="class-row-date">
        <div className="class-row-day">{day}</div>
        <div className="class-row-month">{month}</div>
      </div>

      <div className="class-row-divider" />

      <div className="class-row-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--fi-space-2)', flexWrap: 'wrap' }}>
          <div className="class-row-theme">{schedule.proposed_theme}</div>
          {schedule.is_highlighted && (
            <span
              className="badge"
              title="Aula Destaque Excepcional"
              style={{
                fontSize: '0.7rem',
                padding: '1px 8px',
                backgroundColor: 'rgba(234, 179, 8, 0.2)',
                color: '#facc15',
                border: '1px solid rgba(234, 179, 8, 0.4)',
                fontWeight: 600,
              }}
            >
              ⭐ Destaque
            </span>
          )}
          {schedule.has_photo_content && (
            <span className="badge badge-accent" title="Conteúdo interessante para foto" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>
              📸 Foto
            </span>
          )}
          {schedule.has_video_content && (
            <span className="badge badge-accent" title="Conteúdo interessante para vídeo" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>
              🎥 Vídeo
            </span>
          )}
        </div>

        {schedule.theme_description && (
          <div
            style={{
              fontSize: '0.78rem',
              color: 'var(--fi-color-text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginTop: '2px',
            }}
          >
            {schedule.theme_description}
          </div>
        )}

        {schedule.techniques && schedule.techniques.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: '4px',
              flexWrap: 'wrap',
              marginTop: '4px',
            }}
          >
            {schedule.techniques.map((tech) => (
              <span
                key={tech}
                style={{
                  fontSize: '0.7rem',
                  padding: '1px 6px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: 'var(--fi-color-text-muted)',
                  border: '1px solid var(--fi-color-border-subtle)',
                }}
              >
                #{tech}
              </span>
            ))}
          </div>
        )}

        {schedule.course && (
          <div className="class-row-course" style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: trackTheme.border,
              }}
            />
            <span style={{ color: trackTheme.text, fontWeight: 500 }}>
              {schedule.course.title}
            </span>
            <span style={{ color: 'var(--fi-color-text-muted)' }}>
              · {schedule.course.schedule_day === 'Monday' ? 'Segunda' : schedule.course.schedule_day === 'Wednesday' ? 'Quarta' : schedule.course.schedule_day}
            </span>
          </div>
        )}
      </div>

      <div className="class-row-actions">
        <PlanningBadge isPlanned={isPlannedEffective} isPast={isPast} isCancelled={schedule.is_cancelled ?? undefined} />
        <span style={{ color: 'var(--fi-color-text-muted)', fontSize: '0.875rem' }}>›</span>
      </div>
    </div>
  );
}
