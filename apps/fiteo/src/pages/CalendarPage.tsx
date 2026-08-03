import { useState } from 'react';
import type { CourseTrack } from '@fi/types';
import type { Navigate } from '../App';
import { useCourses } from '../hooks/useCourses';
import { useSchedules, type CreateSchedulePayload } from '../hooks/useSchedules';
import { ClassRow } from '../components/ClassRow';

interface NewClassModalProps {
  courses: CourseTrack[];
  saving: boolean;
  onSubmit: (payload: CreateSchedulePayload) => Promise<boolean>;
  onClose: () => void;
}

function NewClassModal({ courses, saving, onSubmit, onClose }: NewClassModalProps) {
  const [courseId, setCourseId] = useState(courses[0]?.id ?? '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('19:00');
  const [theme, setTheme] = useState('');
  const [isPlanned, setIsPlanned] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!courseId || !date || !theme.trim()) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    const isoDate = new Date(`${date}T${time}:00`).toISOString();
    const ok = await onSubmit({ course_id: courseId, class_date: isoDate, proposed_theme: theme.trim(), is_planned: isPlanned });
    if (ok) onClose();
    else setError('Erro ao criar aula. Tente novamente.');
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="new-class-title">
        <h2 className="modal-title" id="new-class-title">Nova Aula</h2>

        <form onSubmit={handleSubmit} className="stack-4">
          <div className="form-group">
            <label className="form-label" htmlFor="nc-course">Trilha *</label>
            <select
              id="nc-course"
              className="form-select"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="nc-date">Data *</label>
              <input
                id="nc-date"
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="nc-time">Horário</label>
              <input
                id="nc-time"
                type="time"
                className="form-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="nc-theme">Tema Proposto *</label>
            <input
              id="nc-theme"
              type="text"
              className="form-input"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Ex: Introdução a nós base, Tensão e equilíbrio…"
              required
            />
          </div>

          <label
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--fi-space-3)', cursor: 'pointer', fontSize: '0.875rem' }}
          >
            <input
              id="nc-planned"
              type="checkbox"
              checked={isPlanned}
              onChange={(e) => setIsPlanned(e.target.checked)}
            />
            <span>Aula já planejada (material e exercícios definidos)</span>
          </label>

          {error && <p className="form-error">⚠ {error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button id="nc-submit-btn" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" /> Criando…</> : 'Criar Aula'}
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

export function CalendarPage({ navigate, isAdmin, preselectedCourseId }: CalendarPageProps) {
  const { courses } = useCourses();
  const [activeCourseId, setActiveCourseId] = useState<string | null>(preselectedCourseId ?? null);
  const [showNewClass, setShowNewClass] = useState(false);
  const { schedules, loading, saving, error, createSchedule } = useSchedules(activeCourseId);

  const handleCreateSchedule = async (payload: CreateSchedulePayload) => {
    return createSchedule(payload);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Agenda de Aulas</h1>
          <p className="page-subtitle">
            {activeCourseId
              ? courses.find((c) => c.id === activeCourseId)?.title ?? 'Todas as trilhas'
              : 'Todas as trilhas'}
          </p>
        </div>

        {isAdmin && (
          <button id="new-class-btn" className="btn btn-primary" onClick={() => setShowNewClass(true)}>
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
            className={`course-tab ${activeCourseId === course.id ? 'active' : ''}`}
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

      {!loading && error && (
        <div className="alert alert-danger">{error}</div>
      )}

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
        <NewClassModal
          courses={courses}
          saving={saving}
          onSubmit={handleCreateSchedule}
          onClose={() => setShowNewClass(false)}
        />
      )}
    </>
  );
}
