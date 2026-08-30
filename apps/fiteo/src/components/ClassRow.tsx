import type { ClassSchedule } from '@fi/types';
import { PlanningBadge } from './PlanningBadge';
import { getTrackTheme } from '../utils/trackThemes';
import { isClassPast } from '../utils/classTime';

const MONTH_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WEEKDAYS_LONG = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

interface ClassRowProps {
  schedule: ClassSchedule;
  onClick: () => void;
}

export function ClassRow({ schedule, onClick }: ClassRowProps) {
  const date = new Date(schedule.class_date);
  const day = date.getDate().toString().padStart(2, '0');
  const month = MONTH_SHORT[date.getMonth()];
  const weekdayShort = WEEKDAYS_SHORT[date.getDay()];
  const weekdayLong =
    schedule.course?.schedule_day === 'Monday'
      ? 'Segunda'
      : schedule.course?.schedule_day === 'Wednesday'
      ? 'Quarta'
      : schedule.course?.schedule_day ?? WEEKDAYS_LONG[date.getDay()];

  const isPast = isClassPast(schedule.class_date);
  const isPlannedEffective = schedule.is_planned || isPast;

  const trackTitle = schedule.course?.title ?? '';
  const trackTheme = getTrackTheme(trackTitle);

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
      {/* Desktop Date Column */}
      <div className="class-row-date desktop-only">
        <div className="class-row-day" style={{ color: trackTheme.dateDay }}>{day}</div>
        <div className="class-row-month" style={{ color: trackTheme.dateMonth }}>{month}</div>
      </div>

      <div className="class-row-divider desktop-only" style={{ background: trackTheme.borderSubtle }} />

      {/* Main Content Area */}
      <div className="class-row-content">
        {/* Top Header / Meta Row */}
        <div className="class-row-header">
          <div className="class-row-meta">
            {/* Mobile Date Chip */}
            <span
              className="class-row-date-chip mobile-only"
              style={{
                color: trackTheme.text,
                backgroundColor: trackTheme.badgeBg,
                borderColor: trackTheme.borderSubtle,
              }}
            >
              📅 {day} {month} · {weekdayShort}
            </span>

            {/* Course Track Indicator */}
            {schedule.course && (
              <div className="class-row-course" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: trackTheme.border,
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: trackTheme.text, fontWeight: 500 }}>
                  {schedule.course.title}
                </span>
                <span className="desktop-only" style={{ color: 'var(--fi-color-text-muted)' }}>
                  · {weekdayLong}
                </span>
              </div>
            )}
          </div>

          {/* Right Header Elements */}
          <div className="class-row-header-right">
            {/* Badges / Highlights */}
            <div className="class-row-badges">
              {schedule.is_highlighted && (
                <span
                  className="badge badge-highlight"
                  title="Aula Destaque Excepcional"
                  style={{
                    fontSize: '0.7rem',
                    padding: '1px 6px',
                    backgroundColor: 'rgba(234, 179, 8, 0.2)',
                    color: '#facc15',
                    border: '1px solid rgba(234, 179, 8, 0.4)',
                    fontWeight: 600,
                  }}
                >
                  ⭐ <span className="desktop-only">Destaque</span>
                </span>
              )}
              {schedule.has_photo_content && (
                <span
                  className="badge badge-accent"
                  title="Conteúdo interessante para foto"
                  style={{ fontSize: '0.7rem', padding: '1px 5px' }}
                >
                  📸 <span className="desktop-only">Foto</span>
                </span>
              )}
              {schedule.has_video_content && (
                <span
                  className="badge badge-accent"
                  title="Conteúdo interessante para vídeo"
                  style={{ fontSize: '0.7rem', padding: '1px 5px' }}
                >
                  🎥 <span className="desktop-only">Vídeo</span>
                </span>
              )}
            </div>

            {/* Mobile Status Badge */}
            <div className="mobile-only">
              <PlanningBadge isPlanned={isPlannedEffective} isPast={isPast} isCancelled={schedule.is_cancelled ?? undefined} compact />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="class-row-title-container">
          <div className="class-row-theme">{schedule.proposed_theme}</div>
        </div>

        {/* Description */}
        {schedule.theme_description && (
          <div className="class-row-description">
            {schedule.theme_description}
          </div>
        )}

        {/* Techniques Tags */}
        {schedule.techniques && schedule.techniques.length > 0 && (
          <div className="class-row-tags">
            {schedule.techniques.map((tech) => (
              <span key={tech} className="class-row-tag">
                #{tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Actions */}
      <div className="class-row-actions desktop-only">
        <PlanningBadge isPlanned={isPlannedEffective} isPast={isPast} isCancelled={schedule.is_cancelled ?? undefined} />
        <span className="class-row-chevron">›</span>
      </div>
    </div>
  );
}
