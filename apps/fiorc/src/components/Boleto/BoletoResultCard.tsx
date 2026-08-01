import { formatCurrency } from '../../utils/categories';

export interface BoletoResult {
  rent_amount: number;
  condo_measured: number;
  condo_credit_prev_month: number;
  total_payable: number;
}

interface Props {
  result: BoletoResult;
  onConfirm: () => void;
  onReset: () => void;
  confirming: boolean;
}

export function BoletoResultCard({ result, onConfirm, onReset, confirming }: Props) {
  const rows = [
    { label: 'Aluguel',               value: result.rent_amount,             key: 'rent' },
    { label: 'med. condomínio',       value: result.condo_measured,          key: 'condo' },
    { label: 'cred. / dif. cond. mês passado', value: result.condo_credit_prev_month, key: 'credit' },
  ];

  return (
    <div>
      <div className="boleto-result">
        {rows.map(row => (
          <div key={row.key} className="boleto-field">
            <span className="boleto-field-label">{row.label}</span>
            <span
              className="boleto-field-value"
              style={{
                color: row.value < 0 ? 'var(--fi-color-success)' : 'var(--fi-color-text)',
              }}
            >
              {formatCurrency(row.value)}
            </span>
          </div>
        ))}
      </div>

      <div className="boleto-total">
        <span className="boleto-total-label">💳 Total a Pagar</span>
        <span className="boleto-total-value">{formatCurrency(result.total_payable)}</span>
      </div>

      <div style={{ display: 'flex', gap: 'var(--fi-space-3)', marginTop: 'var(--fi-space-6)' }}>
        <button
          id="btn-boleto-confirm"
          className="btn btn-primary"
          onClick={onConfirm}
          disabled={confirming}
        >
          {confirming ? <><span className="spinner" /> Salvando…</> : '✓ Confirmar e Salvar'}
        </button>
        <button className="btn btn-secondary" onClick={onReset} disabled={confirming}>
          Tentar outro arquivo
        </button>
      </div>
    </div>
  );
}
