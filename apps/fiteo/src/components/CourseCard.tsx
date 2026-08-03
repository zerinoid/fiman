import type { CourseTrack } from '@fi/types';

const WEEKDAY_LABELS: Record<string, string> = {
  Monday: 'Segunda-feira',
  Tuesday: 'Terça-feira',
  Wednesday: 'Quarta-feira',
  Thursday: 'Quinta-feira',
  Friday: 'Sexta-feira',
  Saturday: 'Sábado',
  Sunday: 'Domingo',
};

const LEVEL_LABELS: Record<string, string> = {
  Beginner: 'Iniciante',
  Intermediate: 'Intermediário',
  Advanced: 'Avançado',
};

const COURSE_ICONS: Record<string, string> = {
  'Teoria das Cordas': '🪢',
  'Sobre Nós': '🌿',
};

interface CourseCardProps {
  course: CourseTrack;
  scheduledCount: number;
  onClick: () => void;
}

export function CourseCard({ course, scheduledCount, onClick }: CourseCardProps) {
  const icon = COURSE_ICONS[course.title] ?? '📚';
  const levelLabel = LEVEL_LABELS[course.skill_level] ?? course.skill_level;
  const dayLabel = WEEKDAY_LABELS[course.schedule_day] ?? course.schedule_day;

  return (
    <div
      className="course-card"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="course-card-icon">{icon}</div>
      <div className="course-card-title">{course.title}</div>

      <div className="course-card-meta">
        <span className={`badge ${course.skill_level === 'Intermediate' ? 'badge-primary' : 'badge-accent'}`}>
          {levelLabel}
        </span>
        <span className="badge badge-ghost">📅 {dayLabel}</span>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
        <div className="course-card-stat">
          <span>📋</span>
          <span>{scheduledCount} aula{scheduledCount !== 1 ? 's' : ''} agendada{scheduledCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}
