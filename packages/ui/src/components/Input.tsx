import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, style, ...props }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--fi-space-1)' }}>
      {label && (
        <label
          htmlFor={id}
          style={{ fontSize: 'var(--fi-text-sm)', color: 'var(--fi-color-text-muted)', fontFamily: 'var(--fi-font-sans)' }}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        style={{
          background: 'var(--fi-color-surface-2)',
          border: `1px solid ${error ? 'var(--fi-color-danger)' : 'var(--fi-color-border)'}`,
          borderRadius: 'var(--fi-radius-sm)',
          color: 'var(--fi-color-text)',
          fontFamily: 'var(--fi-font-sans)',
          fontSize: 'var(--fi-text-md)',
          padding: 'var(--fi-space-2) var(--fi-space-3)',
          outline: 'none',
          width: '100%',
          transition: 'border-color var(--fi-transition-fast)',
          ...style,
        }}
        {...props}
      />
      {error && (
        <span style={{ fontSize: 'var(--fi-text-xs)', color: 'var(--fi-color-danger)' }}>
          {error}
        </span>
      )}
    </div>
  );
}
