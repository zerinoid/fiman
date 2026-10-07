import { Card } from '@fi/ui';
import { FiattClientRecord } from '../hooks/useFiattRecords';

type RecordListProps = {
  records: FiattClientRecord[];
  onSelect: (record: FiattClientRecord) => void;
};

export function RecordList({ records, onSelect }: RecordListProps) {
  if (records.length === 0) {
    return <div style={{ textAlign: 'center', color: '#888' }}>Nenhuma ficha encontrada.</div>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
      {records.map((record) => {
        const date = new Date(record.created_at).toLocaleDateString('pt-BR');
        const isPrivada = record.form_type === 'privada';
        return (
          <div key={record.id} onClick={() => onSelect(record)} style={{ cursor: 'pointer' }}>
            <Card style={{
              borderTop: `4px solid ${isPrivada ? 'var(--fi-color-primary)' : 'var(--fi-color-accent)'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem' }}>{record.people?.full_name || 'Desconhecido'}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--fi-color-text-muted)' }}>
                    {record.people?.email}
                  </div>
                </div>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'var(--fi-color-surface-2)',
                  color: isPrivada ? 'var(--fi-color-primary)' : 'var(--fi-color-accent)',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  {record.form_type}
                </span>
              </div>
              <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--fi-color-text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>{record.people?.phone || 'Sem celular'}</span>
                <span>Enviado em {date}</span>
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
