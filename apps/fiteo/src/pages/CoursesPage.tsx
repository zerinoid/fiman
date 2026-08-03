import { useCourses } from '../hooks/useCourses';
import { useSchedules } from '../hooks/useSchedules';
import type { Navigate } from '../App';
import { CourseCard } from '../components/CourseCard';

interface CoursesPageProps {
  navigate: Navigate;
}

export function CoursesPage({ navigate }: CoursesPageProps) {
  const { courses, loading, error } = useCourses();
  const { schedules } = useSchedules(); // all schedules, to count per course

  const countForCourse = (courseId: string) =>
    schedules.filter((s) => s.course_id === courseId).length;

  if (loading) {
    return (
      <div className="loading-center" style={{ minHeight: '300px' }}>
        <div className="spinner spinner-lg" />
        <span>Carregando trilhas…</span>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Trilhas de Estudo</h1>
          <p className="page-subtitle">Cursos ativos no estúdio</p>
        </div>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: 'var(--fi-space-6)' }}>{error}</div>}

      <div className="grid-2">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            scheduledCount={countForCourse(course.id)}
            onClick={() => navigate(`calendar?course_id=${course.id}`)}
          />
        ))}
      </div>

      {!loading && courses.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🗂</div>
          <div className="empty-state-title">Nenhuma trilha ativa</div>
          <div className="empty-state-desc">
            Execute a migração do banco de dados para inicializar as trilhas padrão.
          </div>
        </div>
      )}
    </>
  );
}
