import { useState, useMemo } from 'react';
import type { StudentWithProfile } from '../hooks/useStudents';
import { formatPersonName } from '@fi/types';

export type SortColumn =
  | 'name'
  | 'course_preference'
  | 'current_course'
  | 'status'
  | 'terms_version'
  | 'terms_accepted_at'
  | 'email_verified_at';

export type SortDirection = 'asc' | 'desc';

interface StudentTableProps {
  students: StudentWithProfile[];
  coursesMap: { [courseId: string]: string };
  latestEnrollmentCourseMap: { [personId: string]: string };
  groupsMap: { [personId: string]: string[] };
  lastLessonMap: { [personId: string]: string | null };
  onSelectStudent: (personId: string) => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function formatDateTime(isoString?: string | null): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function getStudentStatus(
  student: StudentWithProfile,
  hasActiveEnrollments: boolean,
  hasLessons: boolean,
) {
  const isPending =
    student.profile?.status === 'pendente' ||
    (Boolean(student.profile) && !student.profile?.email_verified_at && !hasActiveEnrollments && !hasLessons);

  if (isPending) {
    return {
      label: '✉️ Pendente',
      badgeClass: 'badge-warning',
      isPending: true,
      isActive: false,
    };
  }

  const isActive = hasActiveEnrollments || hasLessons;
  if (isActive) {
    return {
      label: 'Ativo',
      badgeClass: 'badge-success',
      isPending: false,
      isActive: true,
    };
  }

  return {
    label: 'Inativo',
    badgeClass: 'badge-neutral',
    isPending: false,
    isActive: false,
  };
}

export function StudentTable({
  students,
  coursesMap,
  latestEnrollmentCourseMap,
  groupsMap,
  lastLessonMap,
  onSelectStudent,
}: StudentTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedStudents = useMemo(() => {
    const list = [...students];

    return list.sort((a, b) => {
      const nameA = formatPersonName(a);
      const nameB = formatPersonName(b);

      let cmp = 0;

      if (sortColumn === 'name') {
        cmp = nameA.localeCompare(nameB, 'pt-BR', { sensitivity: 'base' });
      } else if (sortColumn === 'course_preference') {
        const prefA = a.profile?.course_preference_id ? coursesMap[a.profile.course_preference_id] ?? '' : '';
        const prefB = b.profile?.course_preference_id ? coursesMap[b.profile.course_preference_id] ?? '' : '';
        if (!prefA && prefB) cmp = 1;
        else if (prefA && !prefB) cmp = -1;
        else cmp = prefA.localeCompare(prefB, 'pt-BR', { sensitivity: 'base' });
      } else if (sortColumn === 'current_course') {
        const cA = latestEnrollmentCourseMap[a.id] ?? '';
        const cB = latestEnrollmentCourseMap[b.id] ?? '';
        if (!cA && cB) cmp = 1;
        else if (cA && !cB) cmp = -1;
        else cmp = cA.localeCompare(cB, 'pt-BR', { sensitivity: 'base' });
      } else if (sortColumn === 'status') {
        const statusA = getStudentStatus(a, Boolean(groupsMap[a.id]?.length), Boolean(lastLessonMap[a.id])).label;
        const statusB = getStudentStatus(b, Boolean(groupsMap[b.id]?.length), Boolean(lastLessonMap[b.id])).label;
        cmp = statusA.localeCompare(statusB, 'pt-BR');
      } else if (sortColumn === 'terms_version') {
        const verA = a.profile?.terms_version ?? '';
        const verB = b.profile?.terms_version ?? '';
        if (!verA && verB) cmp = 1;
        else if (verA && !verB) cmp = -1;
        else cmp = verA.localeCompare(verB, 'pt-BR');
      } else if (sortColumn === 'terms_accepted_at') {
        const timeA = a.profile?.terms_accepted_at ? new Date(a.profile.terms_accepted_at).getTime() : 0;
        const timeB = b.profile?.terms_accepted_at ? new Date(b.profile.terms_accepted_at).getTime() : 0;
        if (!timeA && timeB) cmp = 1;
        else if (timeA && !timeB) cmp = -1;
        else cmp = timeA - timeB;
      } else if (sortColumn === 'email_verified_at') {
        const timeA = a.profile?.email_verified_at ? new Date(a.profile.email_verified_at).getTime() : 0;
        const timeB = b.profile?.email_verified_at ? new Date(b.profile.email_verified_at).getTime() : 0;
        if (!timeA && timeB) cmp = 1;
        else if (timeA && !timeB) cmp = -1;
        else cmp = timeA - timeB;
      }

      if (cmp !== 0) {
        return sortDirection === 'asc' ? cmp : -cmp;
      }

      // Desempate estável sempre por nome
      return nameA.localeCompare(nameB, 'pt-BR', { sensitivity: 'base' });
    });
  }, [students, sortColumn, sortDirection, coursesMap, latestEnrollmentCourseMap, groupsMap, lastLessonMap]);

  const renderHeader = (column: SortColumn, label: string) => {
    const isActive = sortColumn === column;
    return (
      <th
        onClick={() => handleSort(column)}
        style={{
          cursor: 'pointer',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          transition: 'background-color 0.15s ease',
        }}
        aria-sort={isActive ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
        title={`Clique para ordenar por ${label}`}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
          <span>{label}</span>
          <span
            style={{
              fontSize: '0.7rem',
              color: isActive ? 'var(--fi-color-primary)' : 'var(--fi-color-text-muted)',
              opacity: isActive ? 1 : 0.45,
            }}
          >
            {isActive ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
          </span>
        </div>
      </th>
    );
  };

  return (
    <div className="table-wrapper">
      <table className="fi-table">
        <thead>
          <tr>
            {renderHeader('name', 'Nome')}
            {renderHeader('course_preference', 'Curso Preferência')}
            {renderHeader('current_course', 'Curso Atual (Última Matrícula)')}
            {renderHeader('status', 'Status')}
            {renderHeader('terms_version', 'Versão Termos')}
            {renderHeader('terms_accepted_at', 'Data Aceitação Termos')}
            {renderHeader('email_verified_at', 'Data Verificação E-mail')}
          </tr>
        </thead>
        <tbody>
          {sortedStudents.map((student) => {
            const displayName = formatPersonName(student);
            const initials = getInitials(displayName);

            const hasActiveEnrollments = Boolean(groupsMap[student.id] && groupsMap[student.id].length > 0);
            const hasLessons = Boolean(lastLessonMap[student.id]);
            const statusInfo = getStudentStatus(student, hasActiveEnrollments, hasLessons);

            const coursePrefTitle = student.profile?.course_preference_id
              ? coursesMap[student.profile.course_preference_id] ?? 'Não encontrado'
              : '—';

            const latestCourseTitle = latestEnrollmentCourseMap[student.id] ?? '—';

            return (
              <tr
                key={student.id}
                onClick={() => onSelectStudent(student.id)}
                style={{ cursor: 'pointer' }}
                title={`Clique para abrir o perfil de ${displayName}`}
              >
                {/* Nome */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'var(--fi-color-primary)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--fi-color-text)' }}>
                        {displayName}
                      </span>
                      {student.email && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--fi-color-text-muted)' }}>
                          {student.email}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Curso Preferência */}
                <td>
                  {coursePrefTitle !== '—' ? (
                    <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                      {coursePrefTitle}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--fi-color-text-muted)' }}>—</span>
                  )}
                </td>

                {/* Curso Atual (baseado na última matrícula) */}
                <td>
                  {latestCourseTitle !== '—' ? (
                    <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                      {latestCourseTitle}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--fi-color-text-muted)' }}>—</span>
                  )}
                </td>

                {/* Status */}
                <td>
                  {statusInfo.isPending ? (
                    <span
                      className="badge badge-warning"
                      style={{
                        fontSize: '0.72rem',
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: '#f59e0b',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                      }}
                      title="Pré-matrícula realizada no site — aguardando confirmação do e-mail"
                    >
                      ✉️ Pendente
                    </span>
                  ) : (
                    <span
                      className={`badge ${statusInfo.isActive ? 'badge-success' : 'badge-neutral'}`}
                      style={{ fontSize: '0.72rem', opacity: statusInfo.isActive ? 1 : 0.7 }}
                    >
                      {statusInfo.label}
                    </span>
                  )}
                </td>

                {/* Versão dos Termos */}
                <td>
                  {student.profile?.terms_version ? (
                    <code style={{ fontSize: '0.75rem', color: 'var(--fi-color-text)' }}>
                      {student.profile.terms_version}
                    </code>
                  ) : (
                    <span style={{ color: 'var(--fi-color-text-muted)' }}>—</span>
                  )}
                </td>

                {/* Data Aceitação Termos */}
                <td>
                  {student.profile?.terms_accepted_at ? (
                    <span style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {formatDateTime(student.profile.terms_accepted_at)}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--fi-color-text-muted)' }}>—</span>
                  )}
                </td>

                {/* Data Verificação E-mail */}
                <td>
                  {student.profile?.email_verified_at ? (
                    <span style={{ fontSize: '0.8rem', color: '#10b981', whiteSpace: 'nowrap' }}>
                      ✓ {formatDateTime(student.profile.email_verified_at)}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#f59e0b',
                        fontStyle: 'italic',
                      }}
                    >
                      Pendente
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default StudentTable;
