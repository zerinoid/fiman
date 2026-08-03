import type { ClassSchedule } from '@fi/types';
import { PlanningBadge } from './PlanningBadge';

const MONTH_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

interface ClassRowProps {
  schedule: ClassSchedule;
  onClick: () => void;
}

export function ClassRow({ schedule, onClick }: ClassRowProps) {
  const date = new Date(schedule.class_date);
  const day = date.getDate().toString().padStart(2, '0');
  const month = MONTH_SHORT[date.getMonth()];

  return (
    <div
      className="class-row"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      id={`class-row-${schedule.id}`}
    >
      <div className="class-row-date">
        <div className="class-row-day">{day}</div>
        <div className="class-row-month">{month}</div>
      </div>

      <div className="class-row-divider" />

      <div className="class-row-body">
        <div className="class-row-theme">{schedule.proposed_theme}</div>
        {schedule.course && (
          <div className="class-row-course">
            {schedule.course.title} · {schedule.course.schedule_day === 'Monday' ? 'Segunda' : schedule.course.schedule_day === 'Wednesday' ? 'Quarta' : schedule.course.schedule_day}
          </div>
        )}
      </div>

      <div className="class-row-actions">
        <PlanningBadge isPlanned={schedule.is_planned} />
        <span style={{ color: 'var(--fi-color-text-muted)', fontSize: '0.875rem' }}>›</span>
      </div>
    </div>
  );
}
