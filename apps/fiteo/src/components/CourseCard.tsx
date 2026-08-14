import type { CourseTrack } from '@fi/types';
import { useEnrolledStudents, scheduleDayToWeekday } from '../hooks/useEnrolledStudents';

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

interface CourseCardProps {
  course: CourseTrack;
  pastCount: number;
  futureCount: number;
  onClick: () => void;
}

export function CourseCard({ course, pastCount, futureCount, onClick }: CourseCardProps) {
  const icon = COURSE_ICONS[course.title] ?? '📚';
  const levelLabel = LEVEL_LABELS[course.skill_level] ?? course.skill_level;
  const dayLabel = WEEKDAY_LABELS[course.schedule_day] ?? course.schedule_day;

  const weekday = scheduleDayToWeekday(course.schedule_day);
  const { students, loading } = useEnrolledStudents(weekday);

  const trackTheme = COURSE_THEMES[course.title] ?? DEFAULT_THEME;

  return (
    <div
      className="course-card"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      style={{
        borderLeft: `4px solid ${trackTheme.border}`,
        backgroundColor: trackTheme.bg,
        boxShadow: `0 2px 8px ${trackTheme.bg}`,
        ...({
          '--course-border-gradient': `linear-gradient(90deg, ${trackTheme.border}, ${trackTheme.border}cc)`,
          '--course-hover-border': trackTheme.border,
        } as React.CSSProperties)
      }}
    >
      <div className="course-card-icon">{icon}</div>
      <div className="course-card-title">{course.title}</div>

      <div className="course-card-meta">
        <span className={`badge ${course.skill_level === 'Intermediate' ? 'badge-primary' : 'badge-accent'}`}>
          {levelLabel}
        </span>
        <span className="badge badge-ghost">📅 {dayLabel}</span>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
        <div className="course-card-stat">
          <span>📋</span>
          <span>{futureCount} aula{futureCount !== 1 ? 's' : ''} agendada{futureCount !== 1 ? 's' : ''}</span>
        </div>
        <div className="course-card-stat">
          <span>✅</span>
          <span>{pastCount} aula{pastCount !== 1 ? 's' : ''} registrada{pastCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {loading ? (
        <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--fi-color-text-muted)' }}>
          Carregando alunos...
        </div>
      ) : students.length > 0 ? (
        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--fi-color-border-subtle)', paddingTop: '0.75rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--fi-color-text-muted)', marginBottom: '0.4rem' }}>
            Alunos Matriculados ({students.length}):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {students.map((student) => {
              const name = student.person?.full_name ?? '—';
              return (
                <span
                  key={student.id}
                  style={{
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--fi-color-border-subtle)',
                    color: 'var(--fi-color-text)',
                  }}
                >
                  {name}
                </span>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--fi-color-border-subtle)', paddingTop: '0.75rem', fontSize: '0.75rem', color: 'var(--fi-color-text-muted)' }}>
          Nenhum aluno matriculado
        </div>
      )}
    </div>
  );
}
