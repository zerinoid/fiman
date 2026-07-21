import React, { useEffect } from 'react';
import { Button } from './Button';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'hsl(0 0% 0% / 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--fi-color-surface)',
          border: '1px solid var(--fi-color-border)',
          borderRadius: 'var(--fi-radius-xl)',
          boxShadow: 'var(--fi-shadow-lg)',
          padding: 'var(--fi-space-8)',
          minWidth: '320px',
          maxWidth: '90vw',
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
      >
        {title && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--fi-space-6)' }}>
            <h2 style={{ margin: 0, fontSize: 'var(--fi-text-xl)', fontFamily: 'var(--fi-font-sans)', color: 'var(--fi-color-text)' }}>
              {title}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close modal">✕</Button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
