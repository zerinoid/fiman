import type { AttendanceWithPerson } from '../hooks/useAttendance';
import type { EnrolledStudent } from '../hooks/useEnrolledStudents';

const MODALITY_LABELS: Record<string, string> = {
  quarterly_group: 'Plano Trimestral',
  private_bundle: 'Pacote Particular',
  single_group: 'Aula Avulsa',
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
  /** Called when the user toggles a student's presence. */
  onToggle: (personId: string, enrollmentId: string | null, currentValue: boolean) => void;
}

export function AttendanceSheet({
  enrolledStudents,
  attendance,
  saving,
  readOnly = false,
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
        const name = enrollment.person?.full_name ?? '—';
        const initial = name.charAt(0).toUpperCase();
        const modalityLabel = MODALITY_LABELS[enrollment.modality] ?? enrollment.modality;

        // Find existing attendance record for this person
        const record = attendance.find((a) => a.person_id === personId);
        // If no record exists, default to absent (false) for display
        const isPresent = record?.present ?? false;

        return (
          <div key={enrollment.id} className={`attendance-row ${isPresent ? 'present' : 'absent'}`}>
            <div className="attendance-person">
              <div className="attendance-avatar">{initial}</div>
              <div>
                <div className="attendance-name">{name}</div>
                <div className="attendance-modality">{modalityLabel}</div>
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
