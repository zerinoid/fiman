import { Card } from '@fi/ui';
import { FiattClientRecord } from '../hooks/useFiattRecords';

type RecordListProps = {
  records: FiattClientRecord[];
  onSelect: (record: FiattClientRecord) => void;
  viewMode?: 'cards' | 'table';
};

export function RecordList({ records, onSelect, viewMode = 'cards' }: RecordListProps) {
  if (records.length === 0) {
    return <div style={{ textAlign: 'center', color: 'var(--fi-color-text-muted)', padding: '2rem' }}>Nenhuma ficha encontrada.</div>;
  }

  const renderBadge = (formType: string) => {
    const isPrivada = formType === 'privada';
    return (
      <span
        style={{
          fontSize: '0.7rem',
          padding: '2px 8px',
          borderRadius: '12px',
          background: 'var(--fi-color-surface-2)',
          color: isPrivada ? 'var(--fi-color-primary)' : 'var(--fi-color-accent)',
          border: `1px solid ${isPrivada ? 'var(--fi-color-primary)' : 'var(--fi-color-accent)'}`,
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          display: 'inline-flex',
          alignItems: 'center',
          whiteSpace: 'nowrap'
        }}
      >
        <span className="badge-label-full">{isPrivada ? 'Privada' : 'Fotográfica'}</span>
        <span className="badge-label-short">{isPrivada ? 'Priv' : 'Foto'}</span>
      </span>
    );
  };

  if (viewMode === 'table') {
    return (
      <div className="horizontal-scroll-container">
        <table className="fiatt-table">
          <thead>
            <tr>
              <th>Nome Completo</th>
              <th>Pseudônimo</th>
              <th>Tipo</th>
              <th>WhatsApp</th>
              <th>E-mail</th>
              <th>Idade</th>
              <th>Pronomes</th>
              <th>Redes Sociais</th>
              <th>Data Desejada</th>
              <th>Enviado em</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => {
              const date = new Date(record.created_at).toLocaleDateString('pt-BR');
              return (
                <tr key={record.id} onClick={() => onSelect(record)}>
                  <td style={{ fontWeight: 600 }}>{record.people?.full_name || 'Desconhecido'}</td>
                  <td>{record.pseudonym || '-'}</td>
                  <td>{renderBadge(record.form_type)}</td>
                  <td>{record.people?.phone || '-'}</td>
                  <td>{record.people?.email || '-'}</td>
                  <td>{record.age ? `${record.age} anos` : '-'}</td>
                  <td>{record.pronouns || '-'}</td>
                  <td>{record.social_media || '-'}</td>
                  <td>{record.desired_date || '-'}</td>
                  <td style={{ color: 'var(--fi-color-text-muted)' }}>{date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
      {records.map((record) => {
        const date = new Date(record.created_at).toLocaleDateString('pt-BR');
        const isPrivada = record.form_type === 'privada';
        return (
          <div key={record.id} onClick={() => onSelect(record)} style={{ cursor: 'pointer' }}>
            <Card style={{
              borderTop: `4px solid ${isPrivada ? 'var(--fi-color-primary)' : 'var(--fi-color-accent)'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', wordBreak: 'break-word' }}>
                    {record.people?.full_name || 'Desconhecido'}
                  </h3>
                  {record.pseudonym && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--fi-color-accent)', marginBottom: '2px' }}>
                      ({record.pseudonym})
                    </div>
                  )}
                  <div style={{ fontSize: '0.85rem', color: 'var(--fi-color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {record.people?.email}
                  </div>
                </div>
                <div>{renderBadge(record.form_type)}</div>
              </div>
              <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--fi-color-text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{record.people?.phone || 'Sem celular'}</span>
                <span>{date}</span>
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
