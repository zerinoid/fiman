import { useState, useEffect } from 'react';
import { DEFAULT_TRACK_THEME, type TrackTheme } from '../utils/trackThemes';

interface MinutesEditorProps {
  classId: string;
  initialValue: string | null;
  saving: boolean;
  trackTheme?: TrackTheme;
  onSave: (classId: string, text: string) => Promise<boolean>;
}

export function MinutesEditor({ classId, initialValue, saving, trackTheme = DEFAULT_TRACK_THEME, onSave }: MinutesEditorProps) {
  const [text, setText] = useState(initialValue ?? '');
  const [saved, setSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Reset when class changes
  useEffect(() => {
    setText(initialValue ?? '');
    setIsDirty(false);
    setSaved(false);
  }, [classId, initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setIsDirty(true);
    setSaved(false);
  };

  const handleSave = async () => {
    const success = await onSave(classId, text);
    if (success) {
      setSaved(true);
      setIsDirty(false);
    }
  };

  return (
    <div className="minutes-editor">
      <textarea
        id="minutes-textarea"
        className="minutes-textarea"
        value={text}
        onChange={handleChange}
        placeholder="Registre o tema trabalhado, exercícios, dificuldades encontradas, próximos passos…"
        disabled={saving}
      />

      <div className="minutes-footer">
        <span className="minutes-hint">
          {isDirty ? '● edições não salvas' : saved ? '✓ salvo' : 'Markdown suportado'}
        </span>
        <button
          id="save-minutes-btn"
          className="btn btn-primary btn-sm"
          style={{
            backgroundColor: trackTheme.primary,
            borderColor: trackTheme.primary,
            color: '#ffffff',
          }}
          onClick={handleSave}
          disabled={saving || !isDirty}
        >
          {saving ? (
            <><span className="spinner" /> Salvando…</>
          ) : (
            'Salvar Ata'
          )}
        </button>
      </div>
    </div>
  );
}
