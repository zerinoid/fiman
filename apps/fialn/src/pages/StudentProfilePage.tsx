import { useState, useEffect } from 'react';
import type { Person, StudentEnrollment } from '@fi/types';
import { supabase } from '../lib/supabase';
import { useStudentProfile } from '../hooks/useStudentProfile';
import { useStudents } from '../hooks/useStudents';
import { useLessons } from '../hooks/useLessons';
import { useStudentFinancials } from '../hooks/useStudentFinancials';
import { useGroupsAndEnrollments } from '../hooks/useGroupsAndEnrollments';
import { useLessonBundles } from '../hooks/useLessonBundles';
import { LessonEntry } from '../components/LessonEntry';
import { TechnicalRadar } from '../components/TechnicalRadar';
import { EnrollModal } from '../components/EnrollModal';
import { AddBundleModal } from '../components/AddBundleModal';
import { EditStudentModal } from '../components/EditStudentModal';
import type { Navigate } from '../App';

type ProfileTab = 'matriculas' | 'timeline' | 'radar' | 'financeiro';

interface StudentProfilePageProps {
  personId: string;
  navigate: Navigate;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    if (!iso.includes('T') || iso.includes('T00:00:00')) {
      const [, yyyy, mm, dd] = match;
      return `${dd}/${mm}/${yyyy}`;
    }
  }
  return new Date(iso).toLocaleDateString('pt-BR');
}


const MODALITY_LABELS: Record<string, string> = {
  monthly_group: 'Plano Mensal Grupo',
  quarterly_group: 'Plano Trimestral Grupo',
  private_bundle: 'Pacote Particular',
  single_group: 'Aula Avulsa Grupo',
  single_private: 'Aula Particular Avulsa',
};

export function StudentProfilePage({ personId, navigate }: StudentProfilePageProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('matriculas');
  const [person, setPerson] = useState<Person | null>(null);
  const [personLoading, setPersonLoading] = useState(true);

  // Modals
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [enrollmentToEdit, setEnrollmentToEdit] = useState<StudentEnrollment | null>(null);

  const { profile, loading: profileLoading, saving, error: saveError, saveProfile } = useStudentProfile(personId);
  const { lessons, loading: lessonsLoading } = useLessons(personId);
  const { studentTransactions, attendance, loading: financialsLoading, error: finError, refresh: refreshFinancials } = useStudentFinancials(personId);
  const { groups, enrollments, saving: enrollmentSaving, createEnrollment, updateEnrollment, updateEnrollmentStatus, deleteEnrollment } = useGroupsAndEnrollments(personId);
  const { bundles, unconsumedLessonsCount, saving: bundleSaving, createBundle, refresh: refreshBundles } = useLessonBundles(personId);
  const { updateStudent, saving: studentSaving } = useStudents();

  const refetchPerson = () => {
    supabase
      .from('people')
      .select('*')
      .eq('id', personId)
      .single()
      .then(({ data }) => {
        setPerson(data as Person | null);
      });
  };

  useEffect(() => {
    setPersonLoading(true);
    supabase
      .from('people')
      .select('*')
      .eq('id', personId)
      .single()
      .then(({ data }) => {
        setPerson(data as Person | null);
        setPersonLoading(false);
      });
  }, [personId]);

  if (personLoading) {
    return (
      <div className="page-wrapper">
        <div className="loading-center" style={{ minHeight: '60vh' }}>
          <div className="spinner spinner-lg" />
          <span>Carregando perfil…</span>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="page-wrapper">
        <div className="empty-state">
          <div className="empty-state-icon">❓</div>
          <p className="empty-state-title">Aluno não encontrado</p>
          <button className="btn btn-ghost btn-sm mt-4" onClick={() => navigate('students')}>
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  // (financial totals are shown in ValoresPage, not per-student)

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

  const groupEnrollments = enrollments
    .filter(
      (e) => e.modality === 'monthly_group' || e.modality === 'quarterly_group' || e.modality === 'single_group'
    )
    .sort((a, b) => (b.start_date || '').localeCompare(a.start_date || ''));
  const activeEnrollments = groupEnrollments.filter((e) => e.status === 'active' && !(e.end_date && e.end_date < todayStr));
  const activeBundlesList = bundles.filter((b) => b.status === 'active');

  return (
    <div className="page-wrapper">
      {/* Back + header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--fi-space-3)' }}>
          <button
            id="profile-back-btn"
            className="btn btn-ghost btn-icon"
            onClick={() => navigate('students')}
            aria-label="Voltar"
          >
            ←
          </button>
          <div>
            <h1 className="page-title">{person.full_name}</h1>
            <p className="page-subtitle">
              {lessons.length} aula{lessons.length !== 1 ? 's' : ''} registrada{lessons.length !== 1 ? 's' : ''}
              {person.email && ` · ${person.email}`}
            </p>
          </div>
        </div>

        <div className="flex-gap-2 flex-wrap">
          <button
            id="profile-edit-btn"
            className="btn btn-ghost btn-sm"
            onClick={() => setShowEditModal(true)}
          >
            ✏️ Editar Perfil
          </button>
          <button
            id="profile-bundle-btn"
            className="btn btn-ghost btn-sm"
            onClick={() => setShowBundleModal(true)}
          >
            📦 Novo Pacote
          </button>
          <button
            id="profile-enroll-btn"
            className="btn btn-ghost btn-sm"
            onClick={() => setShowEnrollModal(true)}
          >
            ➕ Nova Matrícula
          </button>
          <button
            id="profile-quick-log-btn"
            className="btn btn-primary btn-sm"
            onClick={() => {
              window.location.hash = `log?person_id=${personId}`;
              navigate('log');
            }}
          >
            ✏️ Registrar Aula
          </button>
        </div>
      </div>

      {/* Top Banners: Active Enrollments & Bundles */}
      {(activeEnrollments.length > 0 || activeBundlesList.length > 0) && (
        <div className="mb-6">
          {/* Active Enrollments Banner - Only shown if student has active enrollments */}
          {activeEnrollments.length > 0 && (
            <div className="card card-sm mb-4">
              <div className="flex-between">
                <div className="section-title">Matrículas & Turmas Ativas</div>
                {/* <button className="btn btn-ghost btn-sm" onClick={() => setShowEnrollModal(true)}> */}
                {/*   + Adicionar */}
                {/* </button> */}
              </div>

              <div className="stack-2 mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {activeEnrollments.map((en) => {
                  const isExpiring = en.status === 'active' && en.end_date && en.end_date >= todayStr && en.end_date <= maxWarningStr;
                  return (
                    <div
                      key={en.id}
                      style={{
                        background: isExpiring ? 'hsl(38, 92%, 56%, 0.03)' : 'var(--fi-color-surface-2)',
                        border: `1px solid ${isExpiring ? 'var(--fi-color-warning)' : 'var(--fi-color-border)'}`,
                        borderRadius: 'var(--fi-radius-md)',
                        padding: '0.5rem 0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        fontSize: '0.85rem',
                        width: '100%',
                        boxShadow: isExpiring ? '0 0 0 1px hsl(38, 92%, 56%, 0.15)' : undefined,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600 }}>
                          {en.group?.name ?? MODALITY_LABELS[en.modality] ?? en.modality}
                        </span>
                        {isExpiring && (
                          <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                            ⚠️ À vencer
                          </span>
                        )}
                        {en.is_partner ? (
                          <span className="badge badge-warning" style={{ fontSize: '0.7rem' }} title={en.partner_details || 'Parceria / Troca de Serviços'}>
                            🤝 Bolsista
                          </span>
                        ) : en.received_by === 'shibarihouse' ? (
                          <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                            🏛️ Shibari House
                          </span>
                        ) : en.received_by === 'foraisso' ? (
                          <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                            👤 Foraisso
                          </span>
                        ) : null}
                        <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                          {en.modality === 'monthly_group' ? 'Mensal' : en.modality === 'quarterly_group' ? 'Trimestral' : en.modality === 'single_group' ? 'Avulsa' : 'Pacote'}
                        </span>
                        {en.end_date && (
                          <span className="text-xs text-mono text-muted" title={en.modality === 'single_group' ? 'Data da aula' : 'Data do fim previsto de expiração'}>
                            {en.modality === 'single_group' ? `(Aula: ${formatDate(en.start_date)})` : `até ${formatDate(en.end_date)}`}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.55rem', alignItems: 'center' }}>
                        <button
                          type="button"
                          title="Editar matrícula"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                          onClick={() => {
                            setEnrollmentToEdit(en);
                            setShowEnrollModal(true);
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          title="Concluir matrícula"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fi-color-text-muted)', fontSize: '0.8rem' }}
                          onClick={() => updateEnrollmentStatus(en.id, 'completed')}
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          title="Excluir matrícula"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                          onClick={() => {
                            if (window.confirm('Tem certeza que deseja excluir esta matrícula?')) {
                              deleteEnrollment(en.id);
                            }
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Lesson Bundles & Pending Lessons Banner */}
          {activeBundlesList.length > 0 && (
            <div className="card card-sm">
              <div className="flex-between">
                <div className="section-title">Aulas Pendentes (Pacotes / Bundles)</div>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowBundleModal(true)}>
                  + Novo Pacote
                </button>
              </div>

              <div className="mt-2 flex-between" style={{ alignItems: 'baseline' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }} className={unconsumedLessonsCount > 0 ? 'text-primary' : 'text-muted'}>
                  {unconsumedLessonsCount} {unconsumedLessonsCount === 1 ? 'aula pendente' : 'aulas pendentes'}
                </div>
                <div className="text-xs text-muted">
                  {activeBundlesList.length} pacote{activeBundlesList.length !== 1 ? 's' : ''} ativo{activeBundlesList.length !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="stack-2 mt-3">
                {activeBundlesList.map((b) => {
                  const remaining = Math.max(0, b.total_lessons - b.used_lessons);
                  const percent = Math.min(100, Math.round((b.used_lessons / b.total_lessons) * 100));
                  return (
                    <div key={b.id} style={{ background: 'var(--fi-color-surface-2)', padding: '0.5rem 0.75rem', borderRadius: 'var(--fi-radius-md)', border: '1px solid var(--fi-color-border)' }}>
                      <div className="flex-between text-xs mb-1">
                        <span style={{ fontWeight: 600 }}>{b.name}</span>
                        <span className="text-mono" style={{ color: 'var(--fi-color-accent)' }}>
                          {b.used_lessons}/{b.total_lessons} consumidas ({remaining} pendentes)
                        </span>
                      </div>
                      <div style={{ height: '6px', background: 'var(--fi-color-surface-3)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, height: '100%', background: 'var(--fi-color-primary)', transition: 'width 300ms ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enroll Modal */}
      {showEnrollModal && (
        <EnrollModal
          personId={personId}
          studentName={person.full_name}
          groups={groups}
          saving={enrollmentSaving}
          enrollmentToEdit={enrollmentToEdit}
          onClose={() => {
            setShowEnrollModal(false);
            setEnrollmentToEdit(null);
          }}
          onSubmit={async (payload) => {
            const ok = await createEnrollment(payload);
            if (ok) {
              refreshFinancials();
            }
            return ok;
          }}
          onUpdate={async (enrollmentId, payload) => {
            const ok = await updateEnrollment(enrollmentId, payload);
            if (ok) {
              refreshFinancials();
            }
            return ok;
          }}
        />
      )}

      {/* Bundle Modal */}
      {showBundleModal && (
        <AddBundleModal
          personId={personId}
          studentName={person.full_name}
          saving={bundleSaving}
          onClose={() => setShowBundleModal(false)}
          onSubmit={async (payload) => {
            const ok = await createBundle(payload);
            if (ok) {
              refreshBundles();
              refreshFinancials();
            }
            return ok;
          }}
        />
      )}

      {/* Edit Student Modal */}
      {showEditModal && (
        <EditStudentModal
          student={{
            id: person.id,
            full_name: person.full_name,
            phone: person.phone,
            email: person.email,
            notes: person.notes,
            financial_status: profile?.financial_status,
          }}
          saving={studentSaving}
          onClose={() => setShowEditModal(false)}
          onSubmit={async (payload) => {
            const ok = await updateStudent(person.id, payload);
            if (ok) {
              refetchPerson();
            }
            return ok;
          }}
        />
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          id="tab-matriculas"
          className={`tab-btn ${activeTab === 'matriculas' ? 'active' : ''}`}
          onClick={() => setActiveTab('matriculas')}
        >
          📋 Matrículas ({enrollments.length})
        </button>
        <button
          id="tab-timeline"
          className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          📅 Linha do Tempo
        </button>
        <button
          id="tab-radar"
          className={`tab-btn ${activeTab === 'radar' ? 'active' : ''}`}
          onClick={() => setActiveTab('radar')}
        >
          🎯 Radar Técnico
        </button>
        <button
          id="tab-financeiro"
          className={`tab-btn ${activeTab === 'financeiro' ? 'active' : ''}`}
          onClick={() => setActiveTab('financeiro')}
        >
          💰 Financeiro
        </button>
      </div>

      {/* ---- TAB: Matrículas ---- */}
      {activeTab === 'matriculas' && (
        <div>
          <div className="flex-between mb-4">
            <div>
              <h2 className="section-title" style={{ fontSize: '1.15rem' }}>MATRÍCULAS DO ALUNO</h2>
              <p className="text-xs text-muted mt-1">
                ({activeEnrollments.length} ativa, {enrollments.length - activeEnrollments.length} concluídas/vencidas)
              </p>
            </div>
            {/* <button className="btn btn-primary btn-sm" onClick={() => setShowEnrollModal(true)}> */}
            {/*   + Nova Matrícula */}
            {/* </button> */}
          </div>

          {groupEnrollments.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 0' }}>
              <div className="empty-state-icon">📋</div>
              <p className="empty-state-title">Nenhuma matrícula cadastrada</p>
              <p className="empty-state-desc">Use o botão "+ Nova Matrícula" para realizar a matrícula do aluno.</p>
            </div>
          ) : (
            <div className="stack-3">
              {groupEnrollments.map((en) => {
                const isInactive = en.status === 'completed' || en.status === 'cancelled';
                const isExpiring = en.status === 'active' && en.end_date && en.end_date >= todayStr && en.end_date <= maxWarningStr;
                return (
                  <div
                    key={en.id}
                    style={{
                      background: isInactive
                        ? 'var(--fi-color-surface-1)'
                        : isExpiring
                        ? 'hsl(38, 92%, 56%, 0.03)'
                        : 'var(--fi-color-surface-2)',
                      border: `1px solid ${
                        isInactive
                          ? 'var(--fi-color-border-subtle)'
                          : isExpiring
                          ? 'var(--fi-color-warning)'
                          : 'var(--fi-color-border)'
                      }`,
                      borderRadius: 'var(--fi-radius-md)',
                      padding: '0.85rem 1.1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      opacity: isInactive ? 0.65 : 1,
                      transition: 'opacity 200ms ease',
                      boxShadow: isExpiring ? '0 0 0 1px hsl(38, 92%, 56%, 0.15)' : undefined,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: isInactive ? 'var(--fi-color-text-muted)' : 'var(--fi-color-text)' }}>
                          {en.group?.name ?? MODALITY_LABELS[en.modality] ?? en.modality}
                        </span>

                        {isExpiring ? (
                          <span className="badge badge-warning">⚠️ À vencer</span>
                        ) : en.status === 'active' ? (
                          <span className="badge badge-success">✓ Ativa</span>
                        ) : en.status === 'completed' ? (
                          en.end_date && en.end_date < todayStr ? (
                            <span className="badge badge-neutral">⌛ Vencida</span>
                          ) : (
                            <span className="badge badge-neutral">✔ Concluída</span>
                          )
                        ) : en.status === 'paused' ? (
                          <span className="badge badge-warning">⏸ Pausada</span>
                        ) : (
                          <span className="badge badge-danger">✖ Cancelada</span>
                        )}

                        {en.is_partner ? (
                          <span className="badge badge-warning" title={en.partner_details || 'Parceria / Troca de Serviços'}>
                            🤝 Bolsista
                          </span>
                        ) : en.received_by === 'shibarihouse' ? (
                          <span className="badge badge-neutral">
                            🏛️ Shibari House
                          </span>
                        ) : en.received_by === 'foraisso' ? (
                          <span className="badge badge-neutral">
                            👤 Foraisso
                          </span>
                        ) : null}
                      </div>

                      <div style={{fontSize: '0.85rem', color: 'var(--fi-color-text-muted)'}}>
                        <strong>{MODALITY_LABELS[en.modality] ?? en.modality}</strong>
                        {en.group && ` (${en.group.weekday === 1 ? 'Segundas-feiras' : en.group.weekday === 3 ? 'Quartas-feiras' : `Dia ${en.group.weekday}`})`}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--fi-color-text-muted)', paddingTop: '0.25rem', borderTop: '1px solid var(--fi-color-border-subtle)' }}>
                      <div className="text-mono" style={{ fontSize: '0.82rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {en.modality === 'single_group' ? (
                          <span>📅 <strong>Data da Aula:</strong> {formatDate(en.start_date)}</span>
                        ) : (
                          <>
                            <span>📅 <strong>Início:</strong> {formatDate(en.start_date)}</span>
                            <span style={{ color: 'var(--fi-color-border-subtle)' }}>|</span>
                            <span>📅 <strong>Fim previsto:</strong> {formatDate(en.end_date)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--fi-color-text-muted)', paddingTop: '0.25rem', borderTop: '1px solid var(--fi-color-border-subtle)' }}>
                    <div>{en.notes && (
                      <p className="text-xs text-muted" style={{ fontStyle: 'italic', margin: 0 }}>
                        Obs: {en.notes}
                      </p>
                    )}</div>

                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          title="Editar matrícula"
                          onClick={() => {
                            setEnrollmentToEdit(en);
                            setShowEnrollModal(true);
                          }}
                        >
                          ✏️ Editar
                        </button>
                        {en.status === 'active' && !(en.end_date && en.end_date < todayStr) && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            title="Concluir / Encerrar matrícula"
                            onClick={() => updateEnrollmentStatus(en.id, 'completed')}
                          >
                            ✓ Concluir
                          </button>
                        )}
                        {en.status === 'completed' && !(en.end_date && en.end_date < todayStr) && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            title="Reativar matrícula"
                            onClick={() => updateEnrollmentStatus(en.id, 'active')}
                          >
                            🔄 Reativar
                          </button>
                        )}
                        {!isInactive ? (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--fi-color-danger)' }}
                            title="Excluir matrícula"
                            onClick={() => {
                              if (window.confirm('Tem certeza que deseja excluir esta matrícula?')) {
                                deleteEnrollment(en.id);
                              }
                            }}
                          >
                            🗑️ Excluir
                          </button>
                        ) : (
                          <span title="Matrículas vencidas/concluídas não podem ser excluídas" style={{ fontSize: '0.75rem', opacity: 0.5, cursor: 'not-allowed' }}>
                            🔒 Histórico
                          </span>
                        )}
                      </div>
                  </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ---- TAB: Linha do Tempo ---- */}
      {activeTab === 'timeline' && (
        <div className="stack-6">
          {/* Active / All Bundles Cards in Timeline */}
          {bundles.length > 0 && (
            <div className="card card-sm">
              <div className="flex-between mb-4">
                <div className="section-title">📦 Pacotes de Aulas Adquiridos (Bundles)</div>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowBundleModal(true)}>
                  + Comprar Pacote
                </button>
              </div>

              <div className="stack-3">
                {bundles.map((b) => {
                  const remaining = Math.max(0, b.total_lessons - b.used_lessons);
                  const percent = Math.min(100, Math.round((b.used_lessons / b.total_lessons) * 100));
                  return (
                    <div
                      key={b.id}
                      style={{
                        background: 'var(--fi-color-surface-2)',
                        border: '1px solid var(--fi-color-border)',
                        borderRadius: 'var(--fi-radius-md)',
                        padding: '0.75rem 1rem',
                      }}
                    >
                      <div className="flex-between">
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{b.name}</span>
                          <span className="text-xs text-muted ml-2">
                            (Comprado em {formatDate(b.created_at)})
                          </span>
                        </div>
                        <div>
                          <span className={`badge ${b.status === 'active' ? 'badge-primary' : 'badge-neutral'}`}>
                            {b.status === 'active' ? `Ativo (${remaining} pendentes)` : 'Concluído'}
                          </span>
                        </div>
                      </div>

                      <div className="flex-between text-xs text-muted mt-2 mb-1">
                        <span>Progresso de consumo:</span>
                        <span className="text-mono">{b.used_lessons} de {b.total_lessons} aulas utilizadas</span>
                      </div>

                      <div style={{ height: '8px', background: 'var(--fi-color-surface-3)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${percent}%`,
                            height: '100%',
                            background: b.status === 'active' ? 'var(--fi-color-primary)' : 'var(--fi-color-text-muted)',
                            transition: 'width 300ms ease',
                          }}
                        />
                      </div>

                      {b.notes && (
                        <p className="text-xs text-muted mt-2" style={{ fontStyle: 'italic' }}>
                          Obs: {b.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {lessonsLoading && (
            <div className="loading-center">
              <div className="spinner spinner-lg" />
            </div>
          )}

          {!lessonsLoading && lessons.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <p className="empty-state-title">Nenhuma aula registrada</p>
              <p className="empty-state-desc">
                Use o botão "Registrar Aula" para adicionar a primeira aula.
              </p>
            </div>
          )}

          {!lessonsLoading && lessons.length > 0 && (
            <div className="stack-4">
              <div className="section-title">Aulas Registradas</div>
              {lessons.map((lesson) => (
                <LessonEntry key={lesson.id} lesson={lesson} />
              ))}
            </div>
          )}

          {/* Histórico de Grupos (presença em aulas coletivas) — migrado da aba Financeiro */}
          {attendance.length > 0 && (
            <div className="card card-sm">
              <div className="section-header">
                <span className="section-title">Histórico de Grupos</span>
                <span className="badge badge-neutral">{attendance.filter((a) => a.present).length} presenças</span>
              </div>
              <table className="fi-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Trilha</th>
                    <th>Tema</th>
                    <th>Presença</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((att) => (
                    <tr key={att.id}>
                      <td className="text-mono text-xs">{formatDate(att.class_date)}</td>
                      <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>{att.course_title ?? '—'}</td>
                      <td>{att.proposed_theme ?? '—'}</td>
                      <td>
                        {att.present
                          ? <span className="badge badge-success">✓ Presente</span>
                          : <span className="badge badge-danger">✗ Ausente</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ---- TAB: Radar Técnico ---- */}
      {activeTab === 'radar' && (
        <div>
          {profileLoading ? (
            <div className="loading-center">
              <div className="spinner spinner-lg" />
            </div>
          ) : (
            <TechnicalRadar
              profile={profile}
              saving={saving}
              error={saveError}
              onSave={saveProfile}
            />
          )}
        </div>
      )}

      {/* ---- TAB: Financeiro ---- */}
      {activeTab === 'financeiro' && (
        <div className="stack-6">
          {financialsLoading && (
            <div className="loading-center">
              <div className="spinner spinner-lg" />
            </div>
          )}

          {finError && !financialsLoading && (
            <div className="alert alert-error">✗ {finError}</div>
          )}

          {!financialsLoading && !finError && (
            <>
              {/* Transactions table */}
              {studentTransactions.length > 0 ? (
                <div className="card card-sm">
                  <div className="section-header">
                    <span className="section-title">Transações</span>
                    <span className="badge badge-neutral">{studentTransactions.length} registro{studentTransactions.length !== 1 ? 's' : ''}</span>
                  </div>
                  <table className="fi-table">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Descrição</th>
                        <th>Recebedor</th>
                        <th>Valor</th>
                        <th>Pagamento</th>
                        <th>Vencimento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentTransactions.map((tx) => (
                        <tr key={tx.id}>
                          <td className="text-mono text-xs">{formatDate(tx.transaction_date)}</td>
                          <td style={{ fontSize: '0.85rem' }}>
                            {tx.description}
                            {tx.total_installments > 1 && (
                              <span className="text-muted" style={{ fontSize: '0.75rem', marginLeft: '0.25rem' }}>
                                ({tx.installment_index}/{tx.total_installments})
                              </span>
                            )}
                          </td>
                          <td>
                            {tx.received_by === 'shibarihouse' ? (
                              <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>🏛️ Shibari House</span>
                            ) : (
                              <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>👤 Foraisso</span>
                            )}
                          </td>
                          <td className="text-mono" style={{ fontWeight: 600 }}>
                            {formatCurrency(tx.amount)}
                          </td>
                          <td>
                            <span className={`badge ${tx.payment_method === 'pix' ? 'badge-primary' : 'badge-secondary'}`}
                                  style={{ fontSize: '0.75rem' }}>
                              {tx.payment_method === 'pix' ? '⚡ PIX' : '💳 Crédito'}
                            </span>
                          </td>
                          <td className="text-mono text-xs">
                            {tx.due_date ? formatDate(tx.due_date) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">💰</div>
                  <p className="empty-state-title">Nenhuma transação registrada</p>
                  <p className="empty-state-desc">
                    Transações aparecem aqui quando um pagamento é registrado na matrícula.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default StudentProfilePage;
