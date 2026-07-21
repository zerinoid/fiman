import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function Card({ children, style, className }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--fi-color-surface)',
        border: '1px solid var(--fi-color-border)',
        borderRadius: 'var(--fi-radius-lg)',
        padding: 'var(--fi-space-6)',
        boxShadow: 'var(--fi-shadow-md)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
