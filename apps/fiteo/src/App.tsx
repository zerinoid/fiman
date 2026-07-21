
export function App() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--fi-space-4)',
        padding: 'var(--fi-space-8)',
      }}
    >
      <div
        style={{
          background: 'var(--fi-color-surface)',
          border: '1px solid var(--fi-color-border)',
          borderRadius: 'var(--fi-radius-xl)',
          padding: 'var(--fi-space-8)',
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 8px 32px hsl(0 0% 0% / 0.5)',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--fi-radius-lg)',
            background: 'hsl(var(--fi-hue-primary), 72%, 60%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            margin: '0 auto var(--fi-space-6)',
          }}
        >
          📅
        </div>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            marginBottom: 'var(--fi-space-2)',
            color: 'var(--fi-color-text)',
          }}
        >
          FITEO
        </h1>
        <p style={{ color: 'var(--fi-color-text-muted)', fontSize: '0.95rem' }}>
          Sistema de Aulas &amp; Planejamento
        </p>
        <div
          style={{
            marginTop: 'var(--fi-space-6)',
            padding: 'var(--fi-space-3) var(--fi-space-4)',
            background: 'var(--fi-color-surface-2)',
            borderRadius: 'var(--fi-radius-md)',
            fontSize: '0.8rem',
            color: 'var(--fi-color-accent)',
            fontFamily: 'var(--fi-font-mono)',
          }}
        >
          PRD 00 ✓ — Aguardando PRD 03 (FITEO)
        </div>
      </div>
    </main>
  );
}
