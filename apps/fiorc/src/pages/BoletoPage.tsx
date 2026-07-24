import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { BoletoDropzone } from '../components/Boleto/BoletoDropzone';
import { BoletoResultCard } from '../components/Boleto/BoletoResultCard';
import type { BoletoResult } from '../components/Boleto/BoletoResultCard';
import { useMonthlyTarget } from '../hooks/useMonthlyTarget';

export function BoletoPage() {
  const [result,     setResult]     = useState<BoletoResult | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [saved,      setSaved]      = useState(false);
  const [fileName,   setFileName]   = useState<string | null>(null);

  const d = new Date();
  const { target, upsertTarget } = useMonthlyTarget(d.getFullYear(), d.getMonth() + 1);

  const handleFile = async (file: File) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setSaved(false);
    setFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    const { data, error: fnErr } = await supabase.functions.invoke('parse-boleto', {
      body: formData,
    });

    setLoading(false);

    if (fnErr) {
      setError(`Erro na análise: ${fnErr.message}`);
      return;
    }

    if (data?.error) {
      setError(`Gemini retornou erro: ${data.error}`);
      return;
    }

    setResult(data as BoletoResult);
  };

  const handleConfirm = async () => {
    if (!result) return;
    setConfirming(true);
    setError(null);

    const today = new Date().toISOString().slice(0, 7) + '-01';

    const { error: dbErr } = await supabase
      .from('fiorc_rent_boletos')
      .upsert({
        month_year:              today,
        rent_amount:             result.rent_amount,
        condo_measured:          result.condo_measured,
        condo_credit_prev_month: result.condo_credit_prev_month,
      }, { onConflict: 'month_year' });

    if (dbErr) {
      setError(`Erro ao salvar: ${dbErr.message}`);
      setConfirming(false);
      return;
    }

    try {
      const commitments = target?.commitments ? [...target.commitments] : [];
      const existingIdx = commitments.findIndex(c => c.name.toLowerCase() === 'aluguel');
      
      if (existingIdx >= 0) {
        commitments[existingIdx] = { 
          ...commitments[existingIdx], 
          amount: result.total_payable 
        };
      } else {
        commitments.push({
          id: crypto.randomUUID(),
          name: 'Aluguel',
          amount: result.total_payable,
          due_day: 10, // Assuming 10th for Aluguel, could be configurable
          is_paid: false,
        });
      }

      const totalTarget = commitments.reduce((sum, c) => sum + (c.amount || 0), 0);

      await upsertTarget({
        commitments,
        total_target: totalTarget,
      });

      setSaved(true);
    } catch (upsertErr) {
      setError(`Erro ao atualizar meta: ${upsertErr instanceof Error ? upsertErr.message : 'Unknown'}`);
    }

    setConfirming(false);
  };

  const handleReset = () => {
    setResult(null); setError(null); setSaved(false); setFileName(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Boleto OCR</h1>
          <p className="page-subtitle">Extração automática via Gemini AI</p>
        </div>
      </div>

      {saved ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--fi-space-12)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--fi-space-4)' }}>✅</div>
          <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Boleto salvo!</p>
          <p style={{ color: 'var(--fi-color-text-muted)', fontSize: '0.875rem', marginBottom: 'var(--fi-space-6)' }}>
            Os valores foram registrados e a meta de Aluguel atualizada.
          </p>
          <button className="btn btn-secondary" onClick={handleReset}>Analisar outro boleto</button>
        </div>
      ) : result ? (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 'var(--fi-space-4)' }}>
            📄 {fileName ?? 'Boleto'} — Valores Extraídos
          </div>
          {error && <p className="form-error" style={{ marginBottom: '1rem' }}>{error}</p>}
          <BoletoResultCard
            result={result}
            onConfirm={handleConfirm}
            onReset={handleReset}
            confirming={confirming}
          />
        </div>
      ) : (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 'var(--fi-space-6)' }}>📤 Enviar Boleto</div>
          {error && <p className="form-error" style={{ marginBottom: '1rem' }}>{error}</p>}
          <BoletoDropzone onFile={handleFile} loading={loading} />
          <p style={{ marginTop: 'var(--fi-space-4)', fontSize: '0.78rem', color: 'var(--fi-color-text-muted)' }}>
            Formatos aceitos: PDF, PNG, JPG, WEBP. Tamanho máximo: 20 MB.
          </p>
        </div>
      )}
    </div>
  );
}
