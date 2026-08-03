import { useState, useEffect } from 'react';
import type { ClassSchedule } from '@fi/types';
import type { Navigate } from '../App';
import { supabase } from '../lib/supabase';
import { useAttendance } from '../hooks/useAttendance';
import { useEnrolledStudents, scheduleDayToWeekday } from '../hooks/useEnrolledStudents';
import { PlanningBadge } from '../components/PlanningBadge';
import { AttendanceSheet } from '../components/AttendanceSheet';
import { MinutesEditor } from '../components/MinutesEditor';

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

  const groupWeekday = schedule?.course
    ? scheduleDayToWeekday(schedule.course.schedule_day)
    : null;

  const { attendance, loading: attendanceLoading, saving, error: attendanceError, togglePresence, saveMinutes } = useAttendance(classId);
  const { students, loading: studentsLoading } = useEnrolledStudents(groupWeekday);

  // Fetch the class schedule + joined course
  useEffect(() => {
    if (!classId) return;
    setLoadingSchedule(true);

    supabase
      .from('fiteo_class_schedules')
      .select('*, course:fiteo_courses(*)')
      .eq('id', classId)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setSchedule(data as unknown as ClassSchedule);
        setLoadingSchedule(false);
      });
  }, [classId]);

  const handleTogglePlanned = async () => {
    if (!schedule || !isAdmin) return;
    setPlanningUpdating(true);
    const newValue = !schedule.is_planned;

    const { error } = await supabase
      .from('fiteo_class_schedules')
      .update({ is_planned: newValue })
      .eq('id', classId);

    if (!error) setSchedule((prev) => prev ? { ...prev, is_planned: newValue } : prev);
    setPlanningUpdating(false);
  };

  const presentCount = attendance.filter((a) => a.present).length;
  const totalEnrolled = students.length;

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

  return (
    <>
      <button className="back-btn" onClick={() => navigate('calendar')}>
        ← Voltar à Agenda
      </button>

      {/* ---- Class header ---- */}
      <div className="card" style={{ marginBottom: 'var(--fi-space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--fi-space-4)', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            {/* Course badges */}
            {schedule.course && (
              <div style={{ display: 'flex', gap: 'var(--fi-space-2)', marginBottom: 'var(--fi-space-3)', flexWrap: 'wrap' }}>
                <span className="badge badge-primary">{schedule.course.title}</span>
                <span className="badge badge-ghost">
                  {WEEKDAY_LABELS[schedule.course.schedule_day] ?? schedule.course.schedule_day}
                </span>
                <span className="badge badge-ghost">
                  {LEVEL_LABELS[schedule.course.skill_level] ?? schedule.course.skill_level}
                </span>
              </div>
            )}

            <h1 className="page-title" style={{ fontSize: '1.4rem', marginBottom: 'var(--fi-space-2)' }}>
              {schedule.proposed_theme}
            </h1>
            <p className="text-muted">{formatDateTime(schedule.class_date)}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--fi-space-2)' }}>
            <PlanningBadge isPlanned={schedule.is_planned} />
            {isAdmin && (
              <button
                id="toggle-planned-btn"
                className="btn btn-ghost btn-sm"
                onClick={handleTogglePlanned}
                disabled={planningUpdating}
              >
                {planningUpdating
                  ? <><span className="spinner" /> Atualizando…</>
                  : schedule.is_planned ? 'Marcar não planejada' : 'Marcar como planejada'
                }
              </button>
            )}
          </div>
        </div>

        {/* Attendance summary stat */}
        {!attendanceLoading && (
          <div style={{
            marginTop: 'var(--fi-space-5)',
            paddingTop: 'var(--fi-space-4)',
            borderTop: '1px solid var(--fi-color-border-subtle)',
            display: 'flex',
            gap: 'var(--fi-space-6)',
            flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--fi-color-success)' }}>
                {presentCount}
              </div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>presentes</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--fi-color-text)' }}>
                {totalEnrolled}
              </div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>matriculados</div>
            </div>
            {totalEnrolled > 0 && (
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--fi-color-accent)' }}>
                  {Math.round((presentCount / totalEnrolled) * 100)}%
                </div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>frequência</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ---- Tab nav ---- */}
      <div style={{ display: 'flex', gap: 'var(--fi-space-2)', marginBottom: 'var(--fi-space-6)' }}>
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
            <div className="alert alert-danger" style={{ marginBottom: 'var(--fi-space-4)' }}>
              {attendanceError}
            </div>
          )}

          {(attendanceLoading || studentsLoading) ? (
            <div className="loading-center" style={{ minHeight: '120px' }}>
              <div className="spinner" />
              <span>Carregando alunos…</span>
            </div>
          ) : (
            <AttendanceSheet
              enrolledStudents={students}
              attendance={attendance}
              saving={saving}
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
            saving={saving}
            onSave={saveMinutes}
          />
        </div>
      )}
    </>
  );
}
