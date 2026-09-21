import { useState, useEffect } from 'react';
import type { StudentProfile } from '@fi/types';
import type { ProfileUpdatePayload } from '../hooks/useStudentProfile';

interface TechnicalRadarProps {
  profile: StudentProfile | null;
  saving: boolean;
  error: string | null;
  onSave: (payload: ProfileUpdatePayload) => Promise<boolean>;
}

export function TechnicalRadar({ profile, saving, error, onSave }: TechnicalRadarProps) {
  const [strengths, setStrengths] = useState(profile?.strengths ?? '');
  const [dificulties, setDificulties] = useState(profile?.dificulties ?? '');
  const [growth_pathway, setGrowthPathway] = useState(profile?.growth_pathway ?? '');
  const [dirty, setDirty] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync when profile loads (delayed fetch)
  useEffect(() => {
    setStrengths(profile?.strengths ?? '');
    setDificulties(profile?.dificulties ?? '');
    setGrowthPathway(profile?.growth_pathway ?? '');
    setDirty(false);
  }, [profile]);

  const markDirty = () => { setDirty(true); setSuccessMsg(null); };

  const handleSave = async () => {
    const ok = await onSave({
      strengths: strengths.trim() || null,
      dificulties: dificulties.trim() || null,
      growth_pathway: growth_pathway.trim() || null,
    });
    if (ok) {
      setDirty(false);
      setSuccessMsg('Perfil técnico salvo!');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleReset = () => {
    setStrengths(profile?.strengths ?? '');
    setDificulties(profile?.dificulties ?? '');
    setGrowthPathway(profile?.growth_pathway ?? '');
    setDirty(false);
    setSuccessMsg(null);
  };

  return (
    <div className="stack-6">
      {successMsg && (
        <div className="alert alert-success">✓ {successMsg}</div>
      )}
      {error && (
        <div className="alert alert-error">✗ {error}</div>
      )}

      {/* Informações Declaradas no Cadastro (somente leitura) */}
      <div className="radar-declared-grid">
        <div className="radar-readonly-card">
          <div className="radar-label">
            <span className="radar-label-icon">🪢</span>
            <span>Experiência Declarada</span>
            <span className="badge badge-neutral text-xs" style={{ marginLeft: 'auto', fontWeight: 400 }}>Cadastro</span>
          </div>
          <p className="radar-readonly-text">
            {profile?.shibari_experience ? (
              profile.shibari_experience
            ) : (
              <span className="text-muted" style={{ fontStyle: 'italic' }}>Não informada</span>
            )}
          </p>
        </div>

        <div className="radar-readonly-card">
          <div className="radar-label">
            <span className="radar-label-icon">🎯</span>
            <span>Objetivos no Shibari</span>
            <span className="badge badge-neutral text-xs" style={{ marginLeft: 'auto', fontWeight: 400 }}>Cadastro</span>
          </div>
          <p className="radar-readonly-text">
            {profile?.shibari_goals ? (
              profile.shibari_goals
            ) : (
              <span className="text-muted" style={{ fontStyle: 'italic' }}>Não informados</span>
            )}
          </p>
        </div>
      </div>

      <div className="radar-field">
        <label className="radar-label" htmlFor="radar-strengths">
          <span className="radar-label-icon">💪</span>
          Pontos Fortes & Habilidades
        </label>
        <textarea
          id="radar-strengths"
          className="radar-textarea"
          placeholder="Ex: Equilíbrio corporal, receptividade ao Karada, confiança no Rigger..."
          value={strengths}
          onChange={(e) => { setStrengths(e.target.value); markDirty(); }}
        />
      </div>

      <div className="radar-field">
        <label className="radar-label" htmlFor="radar-dificulties">
          <span className="radar-label-icon">🧩</span>
          Dificuldades Técnicas Atuais
        </label>
        <textarea
          id="radar-dificulties"
          className="radar-textarea"
          placeholder="Ex: Tensão nos ombros, dificuldade em inverter, medo de altura..."
          value={dificulties}
          onChange={(e) => { setDificulties(e.target.value); markDirty(); }}
        />
      </div>

      <div className="radar-field">
        <label className="radar-label" htmlFor="radar-pathway">
          <span className="radar-label-icon">🗺️</span>
          Próximos Milestones & Caminhos
        </label>
        <textarea
          id="radar-pathway"
          className="radar-textarea"
          placeholder="Ex: Introduzir suspensões parciais, trabalhar Futomomo, prática em Nawa Shibari..."
          value={growth_pathway}
          onChange={(e) => { setGrowthPathway(e.target.value); markDirty(); }}
        />
      </div>

      {dirty && (
        <div className="flex-gap-2" style={{ justifyContent: 'flex-end' }}>
          <button
            id="radar-reset-btn"
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleReset}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            id="radar-save-btn"
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <><span className="spinner" /> Salvando…</> : '✓ Salvar Radar'}
          </button>
        </div>
      )}
    </div>
  );
}

export default TechnicalRadar;
