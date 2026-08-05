import { useState, useRef, useEffect } from 'react';
import type { Person } from '@fi/types';
import { supabase } from '../lib/supabase';
import { useLessons } from '../hooks/useLessons';
import { useLessonBundles } from '../hooks/useLessonBundles';
import type { Navigate } from '../App';

function toLocalDatetimeString(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

interface QuickLogPageProps {
  prefilledPersonId?: string | null;
  navigate: Navigate;
}

export function QuickLogPage({ prefilledPersonId, navigate }: QuickLogPageProps) {
  const [students, setStudents] = useState<Person[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);

  const [personId, setPersonId] = useState<string>(prefilledPersonId ?? '');
  const [bundleId, setBundleId] = useState<string>('');
  const [lessonDatetime, setLessonDatetime] = useState(toLocalDatetimeString(new Date()));
  const [duration, setDuration] = useState('1');
  const [location, setLocation] = useState('');
  const [topics, setTopics] = useState('');
  const [performanceNotes, setPerformanceNotes] = useState('');
  const [actionItems, setActionItems] = useState('');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { addLesson, saving, error: saveError } = useLessons(personId || null);
  const { activeBundles } = useLessonBundles(personId || null);

  const topicsRef = useRef<HTMLTextAreaElement>(null);

  // Load student list
  useEffect(() => {
    supabase
      .from('people')
      .select('id, full_name')
      .eq('is_student', true)
      .order('full_name')
      .then(({ data }) => {
        setStudents((data ?? []) as Person[]);
        setStudentsLoading(false);
      });
  }, []);

  // Reset bundle selection when student changes
  useEffect(() => {
    setBundleId('');
  }, [personId]);

  // Auto-focus topics on load (most common first field to fill after picking student)
  useEffect(() => {
    if (prefilledPersonId) {
      topicsRef.current?.focus();
    }
  }, [prefilledPersonId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    if (!personId) { setFormError('Selecione um aluno.'); return; }
    if (!topics.trim()) { setFormError('Informe os tópicos cobertos.'); return; }
    if (!location.trim()) { setFormError('Informe o local da aula.'); return; }

    const durationNum = parseFloat(duration);
    if (isNaN(durationNum) || durationNum <= 0) { setFormError('Informe uma duração válida.'); return; }

    const lessonIso = new Date(lessonDatetime).toISOString();

    const ok = await addLesson({
      person_id: personId,
      bundle_id: bundleId || null,
      lesson_date: lessonIso,
      duration_hours: durationNum,
      location: location.trim(),
      topics_covered: topics.trim(),
      performance_notes: performanceNotes.trim() || null,
      action_items: actionItems.trim() || null,
    });

    if (ok) {
      setSuccessMsg('Aula registrada com sucesso!');
      setTopics('');
      setPerformanceNotes('');
      setActionItems('');
      setLessonDatetime(toLocalDatetimeString(new Date()));
      setTimeout(() => {
        // Navigate back to the student profile if we know the person
        if (personId) {
          window.location.hash = `profile?person_id=${personId}`;
          navigate('profile');
        } else {
          navigate('students');
        }
      }, 1200);
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '640px' }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--fi-space-3)' }}>
          <button
            id="log-back-btn"
            className="btn btn-ghost btn-icon"
            onClick={() => {
              if (prefilledPersonId) {
                window.location.hash = `profile?person_id=${prefilledPersonId}`;
                navigate('profile');
              } else {
                navigate('students');
              }
            }}
            aria-label="Voltar"
          >
            ←
          </button>
          <div>
            <h1 className="page-title">Registrar Aula</h1>
            <p className="page-subtitle">Registro rápido de aula particular</p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success mb-6">✓ {successMsg}</div>
      )}

      <form id="quick-log-form" onSubmit={handleSubmit} className="stack-6">

        {/* Student selector */}
        <div className="form-group">
          <label className="form-label" htmlFor="log-student">Aluno</label>
          <select
            id="log-student"
            className="form-input"
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
            required
            disabled={studentsLoading}
          >
            <option value="">
              {studentsLoading ? 'Carregando alunos…' : 'Selecione um aluno…'}
            </option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.full_name}</option>
            ))}
          </select>
        </div>

        {/* Optional Bundle selector */}
        {personId && activeBundles.length > 0 && (
          <div className="form-group">
            <label className="form-label" htmlFor="log-bundle">
              Consumir crédito de Pacote (Bundle)
              <span className="text-muted text-xs" style={{ fontWeight: 400, marginLeft: '0.5rem' }}>
                (opcional)
              </span>
            </label>
            <select
              id="log-bundle"
              className="form-input"
              value={bundleId}
              onChange={(e) => setBundleId(e.target.value)}
            >
              <option value="">Nenhum (Aula Avulsa sem pacote)</option>
              {activeBundles.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.used_lessons}/{b.total_lessons} consumidas — {b.total_lessons - b.used_lessons} pendentes)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date/time + Duration row */}
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="log-datetime">Data & Hora</label>
            <input
              id="log-datetime"
              type="datetime-local"
              className="form-input"
              value={lessonDatetime}
              onChange={(e) => setLessonDatetime(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="log-duration">Duração (horas)</label>
            <input
              id="log-duration"
              type="number"
              className="form-input"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="0.25"
              max="8"
              step="0.25"
              required
              placeholder="1.5"
            />
            <p className="form-hint">Ex: 1 = 1h, 1.5 = 1h30min</p>
          </div>
        </div>

        {/* Location */}
        <div className="form-group">
          <label className="form-label" htmlFor="log-location">Local</label>
          <input
            id="log-location"
            type="text"
            className="form-input"
            placeholder="Ex: Estúdio, Casa do aluno, Online…"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        {/* Topics — primary field, large */}
        <div className="form-group">
          <label className="form-label" htmlFor="log-topics">Tópicos & Técnicas Cobertos</label>
          <textarea
            id="log-topics"
            ref={topicsRef}
            className="form-input"
            style={{ minHeight: '120px', fontSize: '1rem' }}
            placeholder="Ex: Karada, Single Column Tie, introdução a Futomomo, base de Lifting…"
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            required
          />
        </div>

        {/* Performance notes — optional */}
        <div className="form-group">
          <label className="form-label" htmlFor="log-performance">
            Desempenho & Observações
            <span className="text-muted text-xs" style={{ fontWeight: 400, marginLeft: '0.5rem' }}>
              (opcional)
            </span>
          </label>
          <textarea
            id="log-performance"
            className="form-input"
            placeholder="Pontos positivos, áreas de melhoria, nível de conforto, sensações…"
            value={performanceNotes}
            onChange={(e) => setPerformanceNotes(e.target.value)}
          />
        </div>

        {/* Action items — optional */}
        <div className="form-group">
          <label className="form-label" htmlFor="log-action">
            Dever de Casa / Tarefas
            <span className="text-muted text-xs" style={{ fontWeight: 400, marginLeft: '0.5rem' }}>
              (opcional)
            </span>
          </label>
          <textarea
            id="log-action"
            className="form-input"
            placeholder="Ex: Praticar nó inicial 10x, pesquisar sobre Ushiro Takate Kote, ver vídeo X…"
            value={actionItems}
            onChange={(e) => setActionItems(e.target.value)}
          />
        </div>

        {(formError || saveError) && (
          <div className="alert alert-error">✗ {formError ?? saveError}</div>
        )}

        <button
          id="log-submit-btn"
          type="submit"
          className="btn btn-primary"
          style={{ height: '3.5rem', fontSize: '1.1rem' }}
          disabled={saving}
        >
          {saving ? <><span className="spinner" /> Salvando…</> : '✓ Salvar Aula'}
        </button>
      </form>
    </div>
  );
}

export default QuickLogPage;
