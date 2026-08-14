import { useState } from 'react';
import { useStudents } from '../hooks/useStudents';
import { StudentCard } from '../components/StudentCard';
import { AddStudentModal } from '../components/AddStudentModal';

// We need last lesson dates for all students. We build this in a sub-component
// to avoid a single massive hook doing N fetches.
// Instead we do a single query for all lessons and derive the last-lesson per student.

import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Navigate } from '../App';

interface LastLessonMap {
  [personId: string]: string | null;
}

interface GroupsMap {
  [personId: string]: string[];
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

function useStudentEnrollmentsData(personIds: string[]): {
  groupsMap: GroupsMap;
  expiringSoonDaysMap: { [personId: string]: number };
} {
  const [map, setMap] = useState<{
    groupsMap: GroupsMap;
    expiringSoonDaysMap: { [personId: string]: number };
  }>({ groupsMap: {}, expiringSoonDaysMap: {} });

  const fetch = useCallback(async () => {
    if (personIds.length === 0) {
      setMap({ groupsMap: {}, expiringSoonDaysMap: {} });
      return;
    }

    const { data } = await supabase
      .from('fialn_enrollments')
      .select(`
        person_id,
        modality,
        group:fialn_groups(name),
        end_date
      `)
      .in('person_id', personIds)
      .eq('status', 'active');

    if (!data) return;

    const getLocalDateStr = () => {
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };
    const get7DaysLaterDateStr = () => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    const todayStr = getLocalDateStr();
    const maxWarningStr = get7DaysLaterDateStr();

    const gMap: GroupsMap = {};
    const eSoonDaysMap: { [personId: string]: number } = {};

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    for (const row of data) {
      const pid = row.person_id;
      if (!pid) continue;

      // Skip active enrollments that have expired
      if (row.end_date && row.end_date < todayStr) continue;

      const groupObj = row.group as unknown as { name: string } | null;
      const name = groupObj?.name ?? (row.modality === 'private_bundle' ? 'Pacote Particular' : null);
      if (name) {
        if (!gMap[pid]) gMap[pid] = [];
        if (!gMap[pid].includes(name)) gMap[pid].push(name);
      }

      // Check if expiring soon (within 7 days)
      if (row.end_date && row.end_date >= todayStr && row.end_date <= maxWarningStr) {
        const endDate = new Date(row.end_date + 'T00:00:00');
        const diffTime = endDate.getTime() - todayDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (eSoonDaysMap[pid] === undefined || diffDays < eSoonDaysMap[pid]) {
          eSoonDaysMap[pid] = diffDays;
        }
      }
    }
    setMap({ groupsMap: gMap, expiringSoonDaysMap: eSoonDaysMap });
  }, [personIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetch(); }, [fetch]);

  return map;
}

interface StudentsPageProps {
  navigate: Navigate;
}

export function StudentsPage({ navigate }: StudentsPageProps) {
  const { students, loading, saving, error, refresh, createStudent } = useStudents();
  const [query, setQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const personIds = students.map((s) => s.id);
  const lastLessonMap = useLastLessonDates(personIds);
  const { groupsMap, expiringSoonDaysMap } = useStudentEnrollmentsData(personIds);

  const filtered = students.filter((s) =>
    s.full_name.toLowerCase().includes(query.toLowerCase()),
  );

  const activeStudents = filtered.filter((s) => {
    const hasEnrollments = Boolean(groupsMap[s.id] && groupsMap[s.id].length > 0);
    const hasLessons = Boolean(lastLessonMap[s.id]);
    return hasEnrollments || hasLessons;
  });

  // Sort activeStudents: expiring soon first (ascending by remaining days), then alphabetical
  activeStudents.sort((a, b) => {
    const daysA = expiringSoonDaysMap[a.id];
    const daysB = expiringSoonDaysMap[b.id];
    const aIsExpiring = daysA !== undefined;
    const bIsExpiring = daysB !== undefined;

    if (aIsExpiring && bIsExpiring) {
      return daysA - daysB; // Expiring sooner comes first
    }
    if (aIsExpiring) return -1;
    if (bIsExpiring) return 1;

    return 0; // Both not expiring, keep alphabetical (students is loaded pre-sorted by full_name)
  });

  const inactiveStudents = filtered.filter((s) => {
    const hasEnrollments = Boolean(groupsMap[s.id] && groupsMap[s.id].length > 0);
    const hasLessons = Boolean(lastLessonMap[s.id]);
    return !hasEnrollments && !hasLessons;
  });

  const openProfile = (personId: string) => {
    navigate('profile', { person_id: personId });
  };

  return (
    <div className="page-wrapper">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Alunos</h1>
          <p className="page-subtitle">
            {loading ? 'Carregando…' : `${students.length} aluno${students.length !== 1 ? 's' : ''} cadastrado${students.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          id="btn-add-student"
          className="btn btn-primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          + Novo Aluno
        </button>
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
              ? `Nenhum aluno corresponds a "${query}"`
              : 'Clique no botão "+ Novo Aluno" acima para cadastrar um novo aluno.'}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="stack-6">
          {activeStudents.length > 0 && (
            <div className="stack-4">
              {activeStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  lastLessonDate={lastLessonMap[student.id] ?? null}
                  activeGroupNames={groupsMap[student.id]}
                  daysToExpire={expiringSoonDaysMap[student.id]}
                  onClick={() => openProfile(student.id)}
                />
              ))}
            </div>
          )}

          {inactiveStudents.length > 0 && (
            <div className="stack-4 mt-6">
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--fi-color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid var(--fi-color-border)',
                  marginBottom: '0.5rem',
                }}
              >
                Alunos Inativos ({inactiveStudents.length})
              </div>
              <div className="stack-4">
                {inactiveStudents.map((student) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    lastLessonDate={lastLessonMap[student.id] ?? null}
                    activeGroupNames={groupsMap[student.id]}
                    daysToExpire={expiringSoonDaysMap[student.id]}
                    onClick={() => openProfile(student.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {isAddModalOpen && (
        <AddStudentModal
          saving={saving}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={createStudent}
        />
      )}
    </div>
  );
}
