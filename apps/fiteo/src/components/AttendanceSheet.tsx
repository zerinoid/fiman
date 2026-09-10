import type { AttendanceWithPerson } from '../hooks/useAttendance';
import type { EnrolledStudent } from '../hooks/useEnrolledStudents';
import { DEFAULT_TRACK_THEME, type TrackTheme } from '../utils/trackThemes';
import { formatPersonName } from '@fi/types';

const MODALITY_LABELS: Record<string, string> = {
  quarterly_group: 'Plano Trimestral',
  monthly_group: 'Plano Mensal',
  single_group: 'Aula Avulsa',
  private_bundle: 'Pacote Particular',
  single_private: 'Aula Avulsa Particular',
};

interface AttendanceSheetProps {
  /** Students enrolled in this course (from fialn_enrollments). */
  enrolledStudents: EnrolledStudent[];
  /** Existing attendance records for this class (from fiteo_attendance). */
  attendance: AttendanceWithPerson[];
  /** Whether the toggle controls are disabled (saving in progress). */
  saving: boolean;
  /** Whether the attendance sheet is read-only for this user role. */
  readOnly?: boolean;
  /** Track theme for styling student avatars and details with track colors. */
  trackTheme?: TrackTheme;
  /** Called when the user toggles a student's presence. */
  onToggle: (personId: string, enrollmentId: string | null, currentValue: boolean) => void;
}

export function AttendanceSheet({
  enrolledStudents,
  attendance,
  saving,
  readOnly = false,
  trackTheme = DEFAULT_TRACK_THEME,
  onToggle,
}: AttendanceSheetProps) {
  if (enrolledStudents.length === 0) {
    return (
      <div className="empty-state" style={{ padding: 'var(--fi-space-8) 0' }}>
        <div className="empty-state-icon">👤</div>
        <div className="empty-state-title">Nenhum aluno matriculado</div>
        <div className="empty-state-desc">
          Matricule alunos nesta trilha em FIALN para aparecerem aqui.
        </div>
      </div>
    );
  }

  return (
    <div className="attendance-grid">
      {enrolledStudents.map((enrollment) => {
        const personId = enrollment.person?.id ?? enrollment.person_id;
        const name = formatPersonName(enrollment.person) || '—';
        const initial = name.charAt(0).toUpperCase();
        const modalityLabel = MODALITY_LABELS[enrollment.modality] ?? enrollment.modality;

        // Find existing attendance record for this person
        const record = attendance.find((a) => a.person_id === personId);
        // If no record exists, default to absent (false) for display
        const isPresent = record?.present ?? false;

        return (
          <div key={enrollment.id} className={`attendance-row ${isPresent ? 'present' : 'absent'}`}>
            <div className="attendance-person">
              <div
                className="attendance-avatar"
                style={{
                  backgroundColor: trackTheme.avatarBg,
                  color: trackTheme.avatarText,
                  border: `1px solid ${trackTheme.avatarBorder}`,
                }}
              >
                {initial}
              </div>
              <div>
                <div className="attendance-name">{name}</div>
                <div className="attendance-modality" style={{ color: trackTheme.textMuted }}>{modalityLabel}</div>
              </div>
            </div>

            <label
              className="toggle-switch"
              title={readOnly ? 'Modo de visualização (apenas leitura)' : (isPresent ? 'Marcar como ausente' : 'Marcar como presente')}
              aria-label={`Presença de ${name}`}
            >
              <input
                type="checkbox"
                checked={isPresent}
                disabled={saving || readOnly}
                onChange={() => !readOnly && onToggle(personId, enrollment.id, isPresent)}
              />
              <span className="toggle-track" />
              <span className="toggle-thumb" />
            </label>
          </div>
        );
      })}
    </div>
  );
}
