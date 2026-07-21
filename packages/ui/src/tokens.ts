/**
 * FI Ecosystem Design Tokens
 *
 * Inject the `fiTokens` string into a <style> tag or a CSS file
 * at the root of each app to activate the design system.
 */
export const fiTokens = `
  :root {
    /* ---- Color Palette ---- */
    --fi-hue-primary: 220;
    --fi-hue-accent:  160;

    --fi-color-bg:          hsl(var(--fi-hue-primary), 14%, 8%);
    --fi-color-surface:     hsl(var(--fi-hue-primary), 14%, 12%);
    --fi-color-surface-2:   hsl(var(--fi-hue-primary), 14%, 17%);
    --fi-color-border:      hsl(var(--fi-hue-primary), 14%, 22%);

    --fi-color-primary:     hsl(var(--fi-hue-primary), 72%, 62%);
    --fi-color-primary-dim: hsl(var(--fi-hue-primary), 72%, 52%);
    --fi-color-accent:      hsl(var(--fi-hue-accent),  68%, 58%);

    --fi-color-text:        hsl(var(--fi-hue-primary), 20%, 92%);
    --fi-color-text-muted:  hsl(var(--fi-hue-primary), 10%, 55%);

    --fi-color-success:     hsl(142, 60%, 52%);
    --fi-color-warning:     hsl( 38, 92%, 56%);
    --fi-color-danger:      hsl(  4, 78%, 58%);

    /* ---- Typography ---- */
    --fi-font-sans: 'Inter', system-ui, -apple-system, sans-serif;
    --fi-font-mono: 'JetBrains Mono', 'Fira Code', monospace;

    --fi-text-xs:   0.75rem;
    --fi-text-sm:   0.875rem;
    --fi-text-md:   1rem;
    --fi-text-lg:   1.125rem;
    --fi-text-xl:   1.25rem;
    --fi-text-2xl:  1.5rem;
    --fi-text-3xl:  1.875rem;

    /* ---- Spacing ---- */
    --fi-space-1:  0.25rem;
    --fi-space-2:  0.5rem;
    --fi-space-3:  0.75rem;
    --fi-space-4:  1rem;
    --fi-space-6:  1.5rem;
    --fi-space-8:  2rem;
    --fi-space-12: 3rem;
    --fi-space-16: 4rem;

    /* ---- Border Radius ---- */
    --fi-radius-sm: 0.375rem;
    --fi-radius-md: 0.625rem;
    --fi-radius-lg: 1rem;
    --fi-radius-xl: 1.5rem;
    --fi-radius-full: 9999px;

    /* ---- Shadows ---- */
    --fi-shadow-sm: 0 1px 3px hsl(0 0% 0% / 0.3);
    --fi-shadow-md: 0 4px 16px hsl(0 0% 0% / 0.4);
    --fi-shadow-lg: 0 8px 32px hsl(0 0% 0% / 0.5);

    /* ---- Transitions ---- */
    --fi-transition-fast:   150ms ease;
    --fi-transition-normal: 250ms ease;
    --fi-transition-slow:   400ms ease;
  }
`;
