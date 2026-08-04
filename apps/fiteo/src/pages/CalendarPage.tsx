import { useState } from 'react';
import type { ClassSchedule, CourseTrack } from '@fi/types';
import type { Navigate } from '../App';
import { useCourses } from '../hooks/useCourses';
import {
  useSchedules,
  type CreateSchedulePayload,
  type UpdateSchedulePayload,
} from '../hooks/useSchedules';
import { ClassRow } from '../components/ClassRow';

export interface ScheduleModalProps {
  courses: CourseTrack[];
  saving: boolean;
  /** Existing schedule if editing; null if creating. */
  initialSchedule?: ClassSchedule | null;
  onSubmit: (payload: CreateSchedulePayload | UpdateSchedulePayload) => Promise<boolean>;
  onClose: () => void;
}

export function ScheduleModal({
  courses,
  saving,
  initialSchedule,
  onSubmit,
  onClose,
}: ScheduleModalProps) {
  const isEditing = !!initialSchedule;

  const [courseId, setCourseId] = useState(
    initialSchedule?.course_id ?? courses[0]?.id ?? '',
  );

  // Extract initial date and time strings if editing
  const initialDateObj = initialSchedule ? new Date(initialSchedule.class_date) : null;
  const initialDateStr = initialDateObj
    ? initialDateObj.toISOString().split('T')[0]
    : '';
  const initialTimeStr = initialDateObj
    ? initialDateObj.toTimeString().substring(0, 5)
    : '19:00';

  const [date, setDate] = useState(initialDateStr);
  const [time, setTime] = useState(initialTimeStr);
  const [themeTitle, setThemeTitle] = useState(initialSchedule?.proposed_theme ?? '');
  const [themeDescription, setThemeDescription] = useState(
    initialSchedule?.theme_description ?? '',
  );
  const [isPlanned, setIsPlanned] = useState(initialSchedule?.is_planned ?? false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!courseId || !date || !themeTitle.trim()) {
      setError('Preencha os campos obrigatórios (Trilha, Data e Título).');
      return;
    }

    const isoDate = new Date(`${date}T${time}:00`).toISOString();

    const ok = await onSubmit({
      course_id: courseId,
      class_date: isoDate,
      proposed_theme: themeTitle.trim(),
      theme_description: themeDescription.trim() || null,
      is_planned: isPlanned,
    });

    if (ok) onClose();
    else setError(isEditing ? 'Erro ao atualizar aula.' : 'Erro ao criar aula.');
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-modal-title"
      >
        <h2 className="modal-title" id="schedule-modal-title">
          {isEditing ? 'Editar Aula' : 'Nova Aula'}
        </h2>

        <form onSubmit={handleSubmit} className="stack-4">
          <div className="form-group">
            <label className="form-label" htmlFor="sm-course">
              Trilha *
            </label>
            <select
              id="sm-course"
              className="form-select"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="sm-date">
                Data *
              </label>
              <input
                id="sm-date"
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="sm-time">
                Horário
              </label>
              <input
                id="sm-time"
                type="time"
                className="form-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="sm-theme-title">
              Título do Tema Proposto *
            </label>
            <input
              id="sm-theme-title"
              type="text"
              className="form-input"
              value={themeTitle}
              onChange={(e) => setThemeTitle(e.target.value)}
              placeholder="Ex: Ancoragens Multi-ponto e Equilíbrio"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="sm-theme-desc">
              Descrição do Tema Proposto (opcional)
            </label>
            <textarea
              id="sm-theme-desc"
              className="form-textarea"
              value={themeDescription}
              onChange={(e) => setThemeDescription(e.target.value)}
              rows={3}
              placeholder="Detalhes dos exercícios, conceitos teóricos, distribuição de peso, equipamentos necessários…"
            />
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--fi-space-3)',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            <input
              id="sm-planned"
              type="checkbox"
              checked={isPlanned}
              onChange={(e) => setIsPlanned(e.target.checked)}
            />
            <span>Aula já planejada (material e exercícios definidos)</span>
          </label>

          {error && <p className="form-error">⚠ {error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button
              id="sm-submit-btn"
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner" /> {isEditing ? 'Salving…' : 'Criando…'}
                </>
              ) : isEditing ? (
                'Salvar Alterações'
              ) : (
                'Criar Aula'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- CalendarPage ----

interface CalendarPageProps {
  navigate: Navigate;
  isAdmin: boolean;
  preselectedCourseId?: string | null;
}

export function CalendarPage({
  navigate,
  isAdmin,
  preselectedCourseId,
}: CalendarPageProps) {
  const { courses } = useCourses();
  const [activeCourseId, setActiveCourseId] = useState<string | null>(
    preselectedCourseId ?? null,
  );
  const [showNewClass, setShowNewClass] = useState(false);
  const { schedules, loading, saving, error, createSchedule } =
    useSchedules(activeCourseId);

  const handleCreateSchedule = async (
    payload: CreateSchedulePayload | UpdateSchedulePayload,
  ) => {
    return createSchedule(payload as CreateSchedulePayload);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Agenda de Aulas</h1>
          <p className="page-subtitle">
            {activeCourseId
              ? courses.find((c) => c.id === activeCourseId)?.title ??
                'Todas as trilhas'
              : 'Todas as trilhas'}
          </p>
        </div>

        {isAdmin && (
          <button
            id="new-class-btn"
            className="btn btn-primary"
            onClick={() => setShowNewClass(true)}
          >
            + Nova Aula
          </button>
        )}
      </div>

      {/* Course filter tabs */}
      <div className="course-tabs">
        <button
          className={`course-tab ${activeCourseId === null ? 'active' : ''}`}
          onClick={() => setActiveCourseId(null)}
        >
          Todas
        </button>
        {courses.map((course) => (
          <button
            key={course.id}
            className={`course-tab ${
              activeCourseId === course.id ? 'active' : ''
            }`}
            onClick={() => setActiveCourseId(course.id)}
          >
            {course.title}
          </button>
        ))}
      </div>

      {/* Schedule list */}
      {loading && (
        <div className="loading-center" style={{ minHeight: '200px' }}>
          <div className="spinner spinner-lg" />
          <span>Carregando agenda…</span>
        </div>
      )}

      {!loading && error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && schedules.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <div className="empty-state-title">Nenhuma aula agendada</div>
          <div className="empty-state-desc">
            {isAdmin
              ? 'Clique em "+ Nova Aula" para criar a primeira aula desta trilha.'
              : 'Nenhuma aula agendada para esta trilha ainda.'}
          </div>
        </div>
      )}

      {!loading && !error && schedules.length > 0 && (
        <div className="schedule-list">
          {schedules.map((schedule) => (
            <ClassRow
              key={schedule.id}
              schedule={schedule}
              onClick={() => navigate(`class-detail?class_id=${schedule.id}`)}
            />
          ))}
        </div>
      )}

      {showNewClass && (
        <ScheduleModal
          courses={courses}
          saving={saving}
          onSubmit={handleCreateSchedule}
          onClose={() => setShowNewClass(false)}
        />
      )}
    </>
  );
}
