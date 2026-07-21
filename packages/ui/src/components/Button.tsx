import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, React.CSSProperties> = {
  primary:   { background: 'var(--fi-color-primary)', color: '#fff', border: 'none' },
  secondary: { background: 'var(--fi-color-surface-2)', color: 'var(--fi-color-text)', border: '1px solid var(--fi-color-border)' },
  ghost:     { background: 'transparent', color: 'var(--fi-color-text-muted)', border: 'none' },
  danger:    { background: 'var(--fi-color-danger)', color: '#fff', border: 'none' },
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, React.CSSProperties> = {
  sm: { padding: 'var(--fi-space-1) var(--fi-space-3)', fontSize: 'var(--fi-text-sm)' },
  md: { padding: 'var(--fi-space-2) var(--fi-space-4)', fontSize: 'var(--fi-text-md)' },
  lg: { padding: 'var(--fi-space-3) var(--fi-space-6)', fontSize: 'var(--fi-text-lg)' },
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      style={{
        ...variantStyles[variant],
        ...sizeStyles[size],
        borderRadius: 'var(--fi-radius-md)',
        fontFamily: 'var(--fi-font-sans)',
        fontWeight: 500,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        transition: 'opacity var(--fi-transition-fast), transform var(--fi-transition-fast)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--fi-space-2)',
        ...style,
      }}
      {...props}
    >
      {loading ? '…' : children}
    </button>
  );
}
