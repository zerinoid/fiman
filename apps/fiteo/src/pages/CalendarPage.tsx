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
    : '19:30';

  const [date, setDate] = useState(initialDateStr);
  const [time, setTime] = useState(initialTimeStr);
  const [themeTitle, setThemeTitle] = useState(initialSchedule?.proposed_theme ?? '');
  const [themeDescription, setThemeDescription] = useState(
    initialSchedule?.theme_description ?? '',
  );
  const [isPlanned, setIsPlanned] = useState(initialSchedule?.is_planned ?? false);
  const [isCancelled, setIsCancelled] = useState<boolean>(initialSchedule?.is_cancelled ?? false);

  // FITEO extensions: techniques tags and media toggles
  const [techniques, setTechniques] = useState<string[]>(
    initialSchedule?.techniques ?? [],
  );
  const [tagInput, setTagInput] = useState('');
  const [hasPhotoContent, setHasPhotoContent] = useState<boolean>(
    initialSchedule?.has_photo_content ?? false,
  );
  const [hasVideoContent, setHasVideoContent] = useState<boolean>(
    initialSchedule?.has_video_content ?? false,
  );
  const [isHighlighted, setIsHighlighted] = useState<boolean>(
    initialSchedule?.is_highlighted ?? false,
  );

  const [error, setError] = useState<string | null>(null);

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !techniques.includes(trimmed)) {
      setTechniques((prev) => [...prev, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTechniques((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

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
      techniques,
      has_photo_content: hasPhotoContent,
      has_video_content: hasVideoContent,
      is_highlighted: isHighlighted,
      is_cancelled: isCancelled,
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
        style={{ maxWidth: '540px' }}
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

          {/* Dynamic Technique Tags */}
          <div className="form-group">
            <label className="form-label" htmlFor="sm-technique-input">
              Técnicas Abordadas (Tags)
            </label>
            <div style={{ display: 'flex', gap: 'var(--fi-space-2)' }}>
              <input
                id="sm-technique-input"
                type="text"
                className="form-input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Digite a técnica e pressione Enter (ex: Futomomo, Takate Kote)"
              />
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleAddTag}
                style={{ whiteSpace: 'nowrap' }}
              >
                + Tag
              </button>
            </div>

            {techniques.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--fi-space-2)',
                  flexWrap: 'wrap',
                  marginTop: 'var(--fi-space-2)',
                }}
              >
                {techniques.map((tag) => (
                  <span
                    key={tag}
                    className="badge badge-ghost"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      fontSize: '0.8rem',
                    }}
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--fi-color-text-muted)',
                        cursor: 'pointer',
                        padding: 0,
                        lineHeight: 1,
                        fontSize: '0.9rem',
                      }}
                      title="Remover tag"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Marketing / Disclosure Content Toggles */}
          <div className="form-group stack-2">
            <label className="form-label">Conteúdo para Divulgação / Redes Sociais</label>
            <div
              style={{
                display: 'flex',
                gap: 'var(--fi-space-4)',
                flexWrap: 'wrap',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--fi-space-2)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  padding: '6px 12px',
                  borderRadius: 'var(--fi-radius-md)',
                  backgroundColor: hasPhotoContent
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'transparent',
                  border: '1px solid var(--fi-color-border-subtle)',
                }}
              >
                <input
                  id="sm-photo-toggle"
                  type="checkbox"
                  checked={hasPhotoContent}
                  onChange={(e) => setHasPhotoContent(e.target.checked)}
                />
                <span>📸 Relevante para Foto</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--fi-space-2)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  padding: '6px 12px',
                  borderRadius: 'var(--fi-radius-md)',
                  backgroundColor: hasVideoContent
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'transparent',
                  border: '1px solid var(--fi-color-border-subtle)',
                }}
              >
                <input
                  id="sm-video-toggle"
                  type="checkbox"
                  checked={hasVideoContent}
                  onChange={(e) => setHasVideoContent(e.target.checked)}
                />
                <span>🎥 Relevante para Vídeo</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--fi-space-2)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  padding: '6px 12px',
                  borderRadius: 'var(--fi-radius-md)',
                  backgroundColor: isHighlighted
                    ? 'rgba(234, 179, 8, 0.15)'
                    : 'transparent',
                  border: isHighlighted
                    ? '1px solid rgba(234, 179, 8, 0.4)'
                    : '1px solid var(--fi-color-border-subtle)',
                  color: isHighlighted ? '#facc15' : 'inherit',
                  fontWeight: isHighlighted ? 600 : 400,
                }}
              >
                <input
                  id="sm-highlighted-toggle"
                  type="checkbox"
                  checked={isHighlighted}
                  onChange={(e) => setIsHighlighted(e.target.checked)}
                />
                <span>⭐ Aula Destaque</span>
              </label>
            </div>
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

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--fi-space-3)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              marginTop: 'var(--fi-space-2)',
            }}
          >
            <input
              id="sm-cancelled"
              type="checkbox"
              checked={isCancelled}
              onChange={(e) => setIsCancelled(e.target.checked)}
            />
            <span style={{ color: 'var(--fi-color-danger)', fontWeight: isCancelled ? 600 : 400 }}>
              Aula cancelada
            </span>
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
                  <span className="spinner" /> {isEditing ? 'Salvando…' : 'Criando…'}
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
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyHighlighted, setOnlyHighlighted] = useState(false);
  const { schedules, loading, saving, error, createSchedule } =
    useSchedules(activeCourseId);

  const handleCreateSchedule = async (
    payload: CreateSchedulePayload | UpdateSchedulePayload,
  ) => {
    return createSchedule(payload as CreateSchedulePayload);
  };

  // Filter schedules by search query and highlighted toggle
  const filteredSchedules = schedules.filter((schedule) => {
    if (onlyHighlighted && !schedule.is_highlighted) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const titleMatch = schedule.proposed_theme.toLowerCase().includes(q);
    const descMatch = schedule.theme_description?.toLowerCase().includes(q) ?? false;
    const tagMatch =
      schedule.techniques?.some((tech) => tech.toLowerCase().includes(q)) ?? false;
    return titleMatch || descMatch || tagMatch;
  });

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

      {/* Course filter tabs & Search */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--fi-space-3)',
          marginBottom: 'var(--fi-space-4)',
        }}
      >
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

        <div style={{ display: 'flex', gap: 'var(--fi-space-2)', width: '100%', maxWidth: '560px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '240px' }}>
            <input
              id="search-classes-input"
              type="text"
              className="form-input"
              placeholder="🔍 Pesquisar aulas por tema ou tag de técnica..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            />
          </div>
          <button
            id="filter-highlighted-btn"
            type="button"
            className={`btn ${onlyHighlighted ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setOnlyHighlighted((prev) => !prev)}
            style={{
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
              backgroundColor: onlyHighlighted ? 'rgba(234, 179, 8, 0.25)' : undefined,
              borderColor: onlyHighlighted ? 'rgba(234, 179, 8, 0.5)' : undefined,
              color: onlyHighlighted ? '#facc15' : undefined,
            }}
          >
            ⭐ {onlyHighlighted ? 'Mostrando Destaques' : 'Somente Destaques'}
          </button>
        </div>
      </div>

      {/* Schedule list */}
      {loading && (
        <div className="loading-center" style={{ minHeight: '200px' }}>
          <div className="spinner spinner-lg" />
          <span>Carregando agenda…</span>
        </div>
      )}

      {!loading && error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && filteredSchedules.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <div className="empty-state-title">Nenhuma aula encontrada</div>
          <div className="empty-state-desc">
            {searchQuery
              ? `Nenhuma aula corresponde à busca "${searchQuery}".`
              : isAdmin
              ? 'Clique em "+ Nova Aula" para criar a primeira aula desta trilha.'
              : 'Nenhuma aula agendada para esta trilha ainda.'}
          </div>
        </div>
      )}

      {!loading && !error && filteredSchedules.length > 0 && (
        <div className="schedule-list">
          {filteredSchedules.map((schedule) => (
            <ClassRow
              key={schedule.id}
              schedule={schedule}
              onClick={() => navigate(`class-detail?class_id=${schedule.id}&course_id=${activeCourseId ?? 'all'}`)}
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
