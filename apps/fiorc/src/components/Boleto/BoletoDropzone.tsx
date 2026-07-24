import { useState } from 'react';

interface BoletoDropzoneProps {
  onFile: (file: File) => void;
  loading: boolean;
}

export function BoletoDropzone({ onFile, loading }: BoletoDropzoneProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div
      className={`dropzone${dragActive ? ' drag-active' : ''}`}
      onDragOver={e => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
    >
      {loading ? (
        <>
          <div className="loading-center" style={{ padding: '1rem 0' }}>
            <div className="spinner spinner-lg" />
            <span>Analisando com Gemini…</span>
          </div>
        </>
      ) : (
        <>
          <span className="dropzone-icon">📄</span>
          <p className="dropzone-text">Arraste o boleto aqui</p>
          <p className="dropzone-sub">ou clique para selecionar um PDF ou imagem</p>
          <input
            id="boleto-file-input"
            type="file"
            className="dropzone-input"
            accept="application/pdf,image/*"
            onChange={handleChange}
          />
        </>
      )}
    </div>
  );
}
