import { useState, useEffect } from 'react';
import type { ClassSchedule } from '@fi/types';
import type { Navigate } from '../App';
import { supabase } from '../lib/supabase';
import { useAttendance } from '../hooks/useAttendance';
import { useEnrolledStudents, scheduleDayToWeekday } from '../hooks/useEnrolledStudents';
import { useCourses } from '../hooks/useCourses';
import {
  useSchedules,
  type CreateSchedulePayload,
  type UpdateSchedulePayload,
} from '../hooks/useSchedules';
import { PlanningBadge } from '../components/PlanningBadge';
import { AttendanceSheet } from '../components/AttendanceSheet';
import { MinutesEditor } from '../components/MinutesEditor';
import { ScheduleModal } from './CalendarPage';

const WEEKDAY_LABELS: Record<string, string> = {
  Monday: 'Segunda-feira',
  Wednesday: 'Quarta-feira',
  Tuesday: 'Terça-feira',
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

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${day}/${month}`;
}

type DetailTab = 'attendance' | 'minutes';

interface ClassDetailPageProps {
  classId: string;
  navigate: Navigate;
  isAdmin: boolean;
}

export function ClassDetailPage({ classId, navigate, isAdmin }: ClassDetailPageProps) {
  const [schedule, setSchedule] = useState<ClassSchedule | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [activeTab, setActiveTab] = useState<DetailTab>('attendance');
  const [planningUpdating, setPlanningUpdating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { courses } = useCourses();
  const { updateSchedule, deleteSchedule, saving: scheduleSaving } = useSchedules();

  // Retrieve track schedules for internal pagination (ordered newest first)
  const { schedules: trackSchedules } = useSchedules(schedule?.course_id ?? null);
  const currentIndex = trackSchedules.findIndex((s) => s.id === classId);
  const prevClass =
    currentIndex !== -1 && currentIndex + 1 < trackSchedules.length
      ? trackSchedules[currentIndex + 1]
      : null; // Chronologically older class
  const nextClass =
    currentIndex > 0
      ? trackSchedules[currentIndex - 1]
      : null; // Chronologically newer class

  const groupWeekday = schedule?.course
    ? scheduleDayToWeekday(schedule.course.schedule_day)
    : null;

  const {
    attendance,
    loading: attendanceLoading,
    saving: attendanceSaving,
    error: attendanceError,
    togglePresence,
    saveMinutes,
  } = useAttendance(classId);

  const { students, loading: studentsLoading } = useEnrolledStudents(groupWeekday);

  // Fetch the class schedule + joined course
  const fetchSchedule = () => {
    if (!classId) return;
    setLoadingSchedule(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    supabase
      .from('fiteo_class_schedules')
      .select('*, course:fiteo_courses(*)')
      .eq('id', classId)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setSchedule(data as unknown as ClassSchedule);
        } else {
          setSchedule(null);
        }
        setLoadingSchedule(false);
      });
  };

  useEffect(() => {
    fetchSchedule();
  }, [classId]);

  const handleTogglePlanned = async () => {
    if (!schedule || !isAdmin) return;
    setPlanningUpdating(true);
    const newValue = !schedule.is_planned;

    const { error } = await supabase
      .from('fiteo_class_schedules')
      .update({ is_planned: newValue })
      .eq('id', classId);

    if (!error) setSchedule((prev) => (prev ? { ...prev, is_planned: newValue } : prev));
    setPlanningUpdating(false);
  };

  const handleEditSubmit = async (
    payload: CreateSchedulePayload | UpdateSchedulePayload,
  ) => {
    if (!schedule) return false;
    const ok = await updateSchedule(schedule.id, payload as UpdateSchedulePayload);
    if (ok) {
      fetchSchedule();
    }
    return ok;
  };

  const handleDeleteSchedule = async () => {
    if (!schedule) return;
    setDeleteError(null);
    const res = await deleteSchedule(schedule.id, schedule.class_date);
    if (res.success) {
      navigate('calendar');
    } else {
      setDeleteError(res.error ?? 'Erro ao excluir aula.');
    }
  };

  const presentCount = attendance.filter((a) => a.present).length;
  const totalEnrolled = students.length;

  const isFutureClass = schedule
    ? new Date(schedule.class_date).getTime() > Date.now()
    : false;

  if (loadingSchedule) {
    return (
      <div className="loading-center" style={{ minHeight: '100%' }}>
        <div className="spinner spinner-lg" />
        <span>Carregando aula…</span>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div>
        <button className="back-btn" onClick={() => navigate('calendar')}>
          ← Voltar à Agenda
        </button>
        <div className="alert alert-danger">Aula não encontrada.</div>
      </div>
    );
  }

  const renderPaginationNav = () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--fi-space-4)',
        gap: 'var(--fi-space-2)',
        flexWrap: 'wrap',
      }}
    >
      <button className="back-btn" onClick={() => navigate('calendar')} style={{ margin: 0 }}>
        ← Voltar à Agenda
      </button>

      <div style={{ display: 'flex', gap: 'var(--fi-space-2)', alignItems: 'center' }}>
        {prevClass && (
          <button
            id="prev-class-btn"
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => navigate(`class-detail?class_id=${prevClass.id}`)}
            title={`Aula Anterior: ${prevClass.proposed_theme}`}
            style={{ fontSize: '0.8rem', padding: '4px 10px' }}
          >
            ← {formatShortDate(prevClass.class_date)} {prevClass.proposed_theme}
          </button>
        )}

        {nextClass && (
          <button
            id="next-class-btn"
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => navigate(`class-detail?class_id=${nextClass.id}`)}
            title={`Próxima Aula: ${nextClass.proposed_theme}`}
            style={{ fontSize: '0.8rem', padding: '4px 10px' }}
          >
            {nextClass.proposed_theme} ({formatShortDate(nextClass.class_date)}) →
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {renderPaginationNav()}

      {/* ---- Class header ---- */}
      <div className="card" style={{ marginBottom: 'var(--fi-space-6)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 'var(--fi-space-4)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: '260px' }}>
            {/* Course badges */}
            {schedule.course && (
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--fi-space-2)',
                  marginBottom: 'var(--fi-space-3)',
                  flexWrap: 'wrap',
                }}
              >
                <span className="badge badge-primary">{schedule.course.title}</span>
                <span className="badge badge-ghost">
                  {WEEKDAY_LABELS[schedule.course.schedule_day] ??
                    schedule.course.schedule_day}
                </span>
                <span className="badge badge-ghost">
                  {LEVEL_LABELS[schedule.course.skill_level] ??
                    schedule.course.skill_level}
                </span>
                {schedule.is_highlighted && (
                  <span
                    className="badge"
                    title="Aula Destaque Excepcional"
                    style={{
                      backgroundColor: 'rgba(234, 179, 8, 0.2)',
                      color: '#facc15',
                      border: '1px solid rgba(234, 179, 8, 0.4)',
                      fontWeight: 600,
                    }}
                  >
                    ⭐ Aula Destaque
                  </span>
                )}
                {schedule.has_photo_content && (
                  <span className="badge badge-accent" title="Conteúdo interessante para foto">
                    📸 Divulgação Foto
                  </span>
                )}
                {schedule.has_video_content && (
                  <span className="badge badge-accent" title="Conteúdo interessante para vídeo">
                    🎥 Divulgação Vídeo
                  </span>
                )}
              </div>
            )}

            {/* Theme Title */}
            <h1
              className="page-title"
              style={{ fontSize: '1.4rem', marginBottom: 'var(--fi-space-1)' }}
            >
              {schedule.proposed_theme}
            </h1>

            {/* Theme Description */}
            {schedule.theme_description && (
              <p
                style={{
                  fontSize: '0.88rem',
                  color: 'var(--fi-color-text-muted)',
                  lineHeight: '1.5',
                  marginBottom: 'var(--fi-space-3)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {schedule.theme_description}
              </p>
            )}

            {/* Technique Tags */}
            {schedule.techniques && schedule.techniques.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--fi-space-2)',
                  flexWrap: 'wrap',
                  marginBottom: 'var(--fi-space-3)',
                }}
              >
                {schedule.techniques.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '0.78rem',
                      padding: '2px 10px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      color: 'var(--fi-color-text)',
                      border: '1px solid var(--fi-color-border-subtle)',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <p className="text-muted" style={{ fontSize: '0.8rem' }}>
              📅 {formatDateTime(schedule.class_date)}
            </p>
          </div>

          {/* Action buttons column */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 'var(--fi-space-2)',
            }}
          >
            <PlanningBadge isPlanned={schedule.is_planned || !isFutureClass} isPast={!isFutureClass} />

            <button
              id="toggle-highlight-btn"
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={async () => {
                await updateSchedule(schedule.id, {
                  is_highlighted: !schedule.is_highlighted,
                });
              }}
              style={{
                fontSize: '0.78rem',
                color: schedule.is_highlighted ? '#facc15' : undefined,
                border: schedule.is_highlighted ? '1px solid rgba(234, 179, 8, 0.4)' : undefined,
              }}
              title={schedule.is_highlighted ? 'Remover destaque' : 'Marcar como aula destaque'}
            >
              ⭐ {schedule.is_highlighted ? 'Destaque' : 'Marcar Destaque'}
            </button>

            {isAdmin && (
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--fi-space-2)',
                  marginTop: 'var(--fi-space-2)',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  id="toggle-planned-btn"
                  className="btn btn-ghost btn-sm"
                  onClick={handleTogglePlanned}
                  disabled={planningUpdating}
                >
                  {planningUpdating ? (
                    <>
                      <span className="spinner" /> Atualizando…
                    </>
                  ) : schedule.is_planned ? (
                    'Marcar não planejada'
                  ) : (
                    'Marcar como planejada'
                  )}
                </button>

                <button
                  id="edit-class-btn"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowEditModal(true)}
                >
                  ✏️ Editar
                </button>

                {isFutureClass ? (
                  <button
                    id="delete-class-btn"
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--fi-color-danger)' }}
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    🗑️ Excluir
                  </button>
                ) : (
                  <button
                    id="delete-class-disabled-btn"
                    className="btn btn-ghost btn-sm"
                    disabled
                    title="Aulas já realizadas possuem histórico de presença e não podem ser excluídas."
                    style={{ opacity: 0.5, cursor: 'not-allowed' }}
                  >
                    🔒 Histórico imutável
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Attendance summary stat */}
        {!attendanceLoading && (
          <div
            style={{
              marginTop: 'var(--fi-space-5)',
              paddingTop: 'var(--fi-space-4)',
              borderTop: '1px solid var(--fi-color-border-subtle)',
              display: 'flex',
              gap: 'var(--fi-space-6)',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--fi-color-success)',
                }}
              >
                {presentCount}
              </div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                presentes
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--fi-color-text)',
                }}
              >
                {totalEnrolled}
              </div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                matriculados
              </div>
            </div>
            {totalEnrolled > 0 && (
              <div>
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: 'var(--fi-color-accent)',
                  }}
                >
                  {Math.round((presentCount / totalEnrolled) * 100)}%
                </div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                  frequência
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ---- Tab nav ---- */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--fi-space-2)',
          marginBottom: 'var(--fi-space-6)',
        }}
      >
        {(['attendance', 'minutes'] as const).map((tab) => (
          <button
            key={tab}
            id={`tab-${tab}`}
            className={`course-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'attendance' ? '👥 Presença' : '📝 Ata da Aula'}
          </button>
        ))}
      </div>

      {/* ---- Tab content ---- */}
      {activeTab === 'attendance' && (
        <div className="card">
          <p className="section-label" style={{ marginBottom: 'var(--fi-space-4)' }}>
            Lista de Presença
          </p>

          {attendanceError && (
            <div
              className="alert alert-danger"
              style={{ marginBottom: 'var(--fi-space-4)' }}
            >
              {attendanceError}
            </div>
          )}

          {attendanceLoading || studentsLoading ? (
            <div className="loading-center" style={{ minHeight: '120px' }}>
              <div className="spinner" />
              <span>Carregando alunos…</span>
            </div>
          ) : (
            <AttendanceSheet
              enrolledStudents={students}
              attendance={attendance}
              saving={attendanceSaving}
              onToggle={togglePresence}
            />
          )}
        </div>
      )}

      {activeTab === 'minutes' && (
        <div className="card">
          <p className="section-label" style={{ marginBottom: 'var(--fi-space-4)' }}>
            Ata da Aula
          </p>
          <MinutesEditor
            classId={classId}
            initialValue={schedule.minutes_and_notes}
            saving={attendanceSaving}
            onSave={saveMinutes}
          />
        </div>
      )}

      {/* Bottom pagination */}
      <div style={{ marginTop: 'var(--fi-space-6)' }}>
        {renderPaginationNav()}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <ScheduleModal
          courses={courses}
          saving={scheduleSaving}
          initialSchedule={schedule}
          onSubmit={handleEditSubmit}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowDeleteConfirm(false)}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-confirm-title"
          >
            <h2 className="modal-title" id="delete-confirm-title">
              Excluir Aula?
            </h2>

            <p style={{ fontSize: '0.9rem', marginBottom: 'var(--fi-space-4)' }}>
              Tem certeza que deseja excluir a aula{' '}
              <strong>"{schedule.proposed_theme}"</strong>? Esta ação não pode ser
              desfeita.
            </p>

            {deleteError && (
              <div
                className="alert alert-danger"
                style={{ marginBottom: 'var(--fi-space-4)' }}
              >
                {deleteError}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </button>
              <button
                id="confirm-delete-btn"
                type="button"
                className="btn btn-primary"
                style={{
                  background: 'var(--fi-color-danger)',
                  borderColor: 'var(--fi-color-danger)',
                  color: 'white',
                }}
                disabled={scheduleSaving}
                onClick={handleDeleteSchedule}
              >
                {scheduleSaving ? (
                  <>
                    <span className="spinner" /> Excluindo…
                  </>
                ) : (
                  'Confirmar Exclusão'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
