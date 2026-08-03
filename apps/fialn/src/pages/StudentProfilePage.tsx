import { useState, useEffect } from 'react';
import type { Person } from '@fi/types';
import { supabase } from '../lib/supabase';
import { useStudentProfile } from '../hooks/useStudentProfile';
import { useLessons } from '../hooks/useLessons';
import { useStudentFinancials } from '../hooks/useStudentFinancials';
import { LessonEntry } from '../components/LessonEntry';
import { TechnicalRadar } from '../components/TechnicalRadar';
import type { Navigate } from '../App';

type ProfileTab = 'timeline' | 'radar' | 'financeiro';

interface StudentProfilePageProps {
  personId: string;
  navigate: Navigate;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  quarterly_plan: 'Plano Trimestral',
  single_class: 'Aula Avulsa',
  private_lesson: 'Aula Particular',
};

export function StudentProfilePage({ personId, navigate }: StudentProfilePageProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('timeline');
  const [person, setPerson] = useState<Person | null>(null);
  const [personLoading, setPersonLoading] = useState(true);

  const { profile, loading: profileLoading, saving, error: saveError, saveProfile } = useStudentProfile(personId);
  const { lessons, loading: lessonsLoading } = useLessons(personId);
  const { incomeTransactions, attendance, loading: financialsLoading, error: finError } = useStudentFinancials(personId);

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

  const totalIncome = incomeTransactions.reduce((acc, tx) => acc + tx.amount, 0);
  const pendingIncome = incomeTransactions.filter((tx) => tx.is_projection).reduce((acc, tx) => acc + tx.amount, 0);
  const confirmedIncome = incomeTransactions.filter((tx) => !tx.is_projection).reduce((acc, tx) => acc + tx.amount, 0);

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

      {/* Tabs */}
      <div className="tabs">
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

      {/* ---- TAB: Linha do Tempo ---- */}
      {activeTab === 'timeline' && (
        <div>
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
              {lessons.map((lesson) => (
                <LessonEntry key={lesson.id} lesson={lesson} />
              ))}
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
              {/* Summary cards */}
              <div className="grid-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="card card-sm" style={{ textAlign: 'center' }}>
                  <div className="text-xs text-muted mb-4">Total Recebido</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700 }} className="text-success">
                    {formatCurrency(confirmedIncome)}
                  </div>
                </div>
                <div className="card card-sm" style={{ textAlign: 'center' }}>
                  <div className="text-xs text-muted mb-4">Projeções Pendentes</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700 }} className="text-warning">
                    {formatCurrency(pendingIncome)}
                  </div>
                </div>
                <div className="card card-sm" style={{ textAlign: 'center' }}>
                  <div className="text-xs text-muted mb-4">Total (Projeções)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700 }} className="text-primary">
                    {formatCurrency(totalIncome)}
                  </div>
                </div>
              </div>

              {/* Income transactions */}
              {incomeTransactions.length > 0 && (
                <div className="card card-sm">
                  <div className="section-header">
                    <span className="section-title">Transações</span>
                  </div>
                  <table className="fi-table">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Descrição</th>
                        <th>Valor</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incomeTransactions.map((tx) => (
                        <tr key={tx.id}>
                          <td className="text-mono text-xs">{formatDate(tx.due_date)}</td>
                          <td>{tx.description ?? '—'}</td>
                          <td className={tx.is_projection ? 'text-warning' : 'text-success'}>
                            {formatCurrency(tx.amount)}
                          </td>
                          <td>
                            {tx.is_projection ? (
                              <span className="badge badge-warning">Projeção</span>
                            ) : (
                              <span className="badge badge-success">Pago {tx.paid_at ? formatDate(tx.paid_at) : ''}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Attendance history */}
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
                        <th>Tema</th>
                        <th>Tipo Pagamento</th>
                        <th>Presença</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((att) => (
                        <tr key={att.id}>
                          <td className="text-mono text-xs">{formatDate(att.class_date)}</td>
                          <td>{att.proposed_theme ?? '—'}</td>
                          <td>
                            {att.payment_type
                              ? <span className="badge badge-primary">{PAYMENT_TYPE_LABELS[att.payment_type] ?? att.payment_type}</span>
                              : <span className="text-muted">—</span>
                            }
                          </td>
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

              {incomeTransactions.length === 0 && attendance.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">💰</div>
                  <p className="empty-state-title">Nenhum dado financeiro</p>
                  <p className="empty-state-desc">
                    Transações e presenças aparecerão aqui quando forem registradas.
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
