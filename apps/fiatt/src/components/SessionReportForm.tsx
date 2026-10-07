import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { FiattClientRecord, useFiattSessions } from '../hooks/useFiattRecords';
import { Button, Input, Card } from '@fi/ui';

type Props = {
  record: FiattClientRecord;
};

export function SessionReportForm({ record }: Props) {
  const { sessions, loading, refetchSessions } = useFiattSessions(record.person_id);
  const [isCreating, setIsCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [sessionDate, setSessionDate] = useState('');
  const [sessionType, setSessionType] = useState(record.form_type);
  const [adminReport, setAdminReport] = useState('');
  const [incidents, setIncidents] = useState('');
  const [aftercare, setAftercare] = useState('');
  const [feedback, setFeedback] = useState('');
  const [txId, setTxId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from('fiatt_sessions').insert({
      person_id: record.person_id,
      client_record_id: record.id,
      session_date: sessionDate,
      admin_report: adminReport,
      incidents: incidents,
      feedback_received: feedback,
      transaction_id: txId || null,
    } as any);

    setSubmitting(false);
    if (!error) {
      setIsCreating(false);
      refetchSessions();
    } else {
      alert('Erro ao salvar sessão: ' + error.message);
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Sessões Realizadas</h3>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} variant="primary">
            + Registrar Sessão
          </Button>
        )}
      </div>

      {isCreating && (
        <Card style={{ marginBottom: '1rem', background: 'var(--fi-color-surface-2)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label>Data da Sessão *</label>
                <Input type="date" required value={sessionDate} onChange={e => setSessionDate(e.target.value)} />
              </div>
              <div>
                <label>Tipo *</label>
                <select 
                  value={sessionType} 
                  onChange={e => setSessionType(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'var(--fi-color-surface)', color: 'white' }}
                >
                  <option value="privada">Privada</option>
                  <option value="fotografica">Fotográfica</option>
                </select>
              </div>
            </div>

            <div>
              <label>Prontuário (Relatório Admin)</label>
              <textarea 
                rows={4} 
                value={adminReport} 
                onChange={e => setAdminReport(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'var(--fi-color-surface)', color: 'white', border: '1px solid var(--fi-color-border)' }}
              />
            </div>

            <div>
              <label>Incidentes (Opcional)</label>
              <textarea 
                rows={2} 
                value={incidents} 
                onChange={e => setIncidents(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'var(--fi-color-surface)', color: 'white', border: '1px solid var(--fi-color-border)' }}
              />
            </div>

            <div>
              <label>Aftercare / Acompanhamento</label>
              <textarea 
                rows={2} 
                value={aftercare} 
                onChange={e => setAftercare(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'var(--fi-color-surface)', color: 'white', border: '1px solid var(--fi-color-border)' }}
              />
            </div>

            <div>
              <label>Feedback do Cliente</label>
              <textarea 
                rows={2} 
                value={feedback} 
                onChange={e => setFeedback(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'var(--fi-color-surface)', color: 'white', border: '1px solid var(--fi-color-border)' }}
              />
            </div>

            <div>
              <label>Transaction ID (Link de Pagamento)</label>
              <Input type="text" value={txId} onChange={e => setTxId(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancelar</Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Salvando...' : 'Salvar Sessão'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div>Carregando histórico...</div>
      ) : sessions.length === 0 && !isCreating ? (
        <div style={{ color: 'var(--fi-color-text-muted)', fontSize: '0.9rem' }}>Nenhuma sessão registrada.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sessions.map(s => (
            <Card key={s.id} style={{ borderLeft: '4px solid var(--fi-color-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong style={{ fontSize: '1.1rem' }}>Sessão realizada em {s.session_date ? new Date(s.session_date).toLocaleDateString('pt-BR') : 'Data Indefinida'}</strong>
              </div>
              {s.admin_report && <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}><strong>Prontuário:</strong> {s.admin_report}</div>}
              {s.incidents && <div style={{ fontSize: '0.9rem', color: 'var(--fi-color-danger)', marginBottom: '0.5rem' }}><strong>Incidentes:</strong> {s.incidents}</div>}
              {s.feedback_received && <div style={{ fontSize: '0.9rem', color: 'var(--fi-color-accent)' }}><strong>Feedback:</strong> {s.feedback_received}</div>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
