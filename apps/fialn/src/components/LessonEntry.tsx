import { useState } from 'react';
import type { Lesson } from '@fi/types';

interface LessonEntryProps {
  lesson: Lesson;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h${m.toString().padStart(2, '0')}`;
}

export function LessonEntry({ lesson }: LessonEntryProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lesson-entry">
      <div
        className="lesson-header"
        onClick={() => setOpen((o) => !o)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="lesson-dot" />
        <span className="lesson-date">{formatDateTime(lesson.lesson_date)}</span>
        <span className="lesson-topics">{lesson.topics_covered}</span>
        <span className="lesson-duration">{formatDuration(lesson.duration_hours)}</span>
        <span className={`lesson-chevron ${open ? 'open' : ''}`}>▾</span>
      </div>

      {open && (
        <div className="lesson-body">
          <div className="lesson-field">
            <span className="lesson-field-label">📍 Local</span>
            <span className="lesson-field-value">{lesson.location}</span>
          </div>

          <div className="lesson-field">
            <span className="lesson-field-label">📚 Tópicos</span>
            <span className="lesson-field-value">{lesson.topics_covered}</span>
          </div>

          {lesson.performance_notes && (
            <div className="lesson-field">
              <span className="lesson-field-label">🎯 Desempenho & Observações</span>
              <span className="lesson-field-value">{lesson.performance_notes}</span>
            </div>
          )}

          {lesson.action_items && (
            <div className="lesson-field">
              <span className="lesson-field-label">✅ Tarefas / Dever de Casa</span>
              <span className="lesson-field-value">{lesson.action_items}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LessonEntry;
