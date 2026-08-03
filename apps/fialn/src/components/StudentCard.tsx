import type { StudentWithProfile } from '../hooks/useStudents';

interface StudentCardProps {
  student: StudentWithProfile;
  lastLessonDate: string | null;
  onClick: () => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function formatRelativeDate(isoDate: string | null): string {
  if (!isoDate) return 'Nenhuma aula ainda';
  const date = new Date(isoDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Última aula: hoje';
  if (diffDays === 1) return 'Última aula: ontem';
  if (diffDays < 7) return `Última aula: ${diffDays} dias atrás`;
  if (diffDays < 30) return `Última aula: ${Math.floor(diffDays / 7)} sem. atrás`;

  return `Última aula: ${date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`;
}

export function StudentCard({ student, lastLessonDate, onClick }: StudentCardProps) {
  const initials = getInitials(student.full_name);
  const relDate = formatRelativeDate(lastLessonDate);
  const hasProfile = student.profile !== null;

  return (
    <div
      id={`student-card-${student.id}`}
      className="card card-hover student-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`Abrir perfil de ${student.full_name}`}
    >
      <div className="student-avatar">{initials}</div>

      <div className="student-info">
        <div className="student-name">{student.full_name}</div>
        <div className="student-meta">{relDate}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
        {hasProfile ? (
          <span className="badge badge-primary">Perfil ✓</span>
        ) : (
          <span className="badge badge-neutral">Sem perfil</span>
        )}
        {student.profile?.financial_status && (
          <span
            className={`badge ${
              student.profile.financial_status === 'em_dia'
                ? 'badge-success'
                : student.profile.financial_status === 'pendente'
                ? 'badge-warning'
                : 'badge-danger'
            }`}
          >
            {student.profile.financial_status === 'em_dia'
              ? '✓ Em dia'
              : student.profile.financial_status === 'pendente'
              ? '⚠ Pendente'
              : '✗ Inadimplente'}
          </span>
        )}
      </div>
    </div>
  );
}
