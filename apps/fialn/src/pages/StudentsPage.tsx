import { useState } from 'react';
import { useStudents } from '../hooks/useStudents';
import { StudentCard } from '../components/StudentCard';

// We need last lesson dates for all students. We build this in a sub-component
// to avoid a single massive hook doing N fetches.
// Instead we do a single query for all lessons and derive the last-lesson per student.

import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Navigate } from '../App';

interface LastLessonMap {
  [personId: string]: string | null;
}

function useLastLessonDates(personIds: string[]): LastLessonMap {
  const [map, setMap] = useState<LastLessonMap>({});

  const fetch = useCallback(async () => {
    if (personIds.length === 0) return;

    const { data } = await supabase
      .from('fialn_lessons')
      .select('person_id, lesson_date')
      .in('person_id', personIds)
      .order('lesson_date', { ascending: false });

    if (!data) return;

    // Keep only the latest per person
    const latest: LastLessonMap = {};
    for (const row of data) {
      const pid = row.person_id;
      if (pid && !latest[pid]) {
        latest[pid] = row.lesson_date;
      }
    }
    setMap(latest);
  }, [personIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetch(); }, [fetch]);

  return map;
}

interface StudentsPageProps {
  navigate: Navigate;
}

export function StudentsPage({ navigate }: StudentsPageProps) {
  const { students, loading, error, refresh } = useStudents();
  const [query, setQuery] = useState('');

  const personIds = students.map((s) => s.id);
  const lastLessonMap = useLastLessonDates(personIds);

  const filtered = students.filter((s) =>
    s.full_name.toLowerCase().includes(query.toLowerCase()),
  );

  const openProfile = (personId: string) => {
    window.location.hash = `profile?person_id=${personId}`;
    navigate('profile');
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Alunos</h1>
          <p className="page-subtitle">
            {loading ? 'Carregando…' : `${students.length} aluno${students.length !== 1 ? 's' : ''} cadastrado${students.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="search-wrapper mb-6">
        <span className="search-icon">🔍</span>
        <input
          id="student-search"
          type="text"
          className="search-input"
          placeholder="Buscar aluno…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* States */}
      {loading && (
        <div className="loading-center">
          <div className="spinner spinner-lg" />
          <span>Carregando alunos…</span>
        </div>
      )}

      {error && !loading && (
        <div className="alert alert-error">
          ✗ {error}
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={refresh}>
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🎓</div>
          <p className="empty-state-title">
            {query ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
          </p>
          <p className="empty-state-desc">
            {query
              ? `Nenhum aluno corresponde a "${query}"`
              : 'Adicione pessoas com is_student = true no banco de dados para vê-las aqui.'}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="stack-4">
          {filtered.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              lastLessonDate={lastLessonMap[student.id] ?? null}
              onClick={() => openProfile(student.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
