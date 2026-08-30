export interface TrackTheme {
  primary: string;
  primaryHover: string;
  dateDay: string;
  dateMonth: string;
  border: string;
  borderSubtle: string;
  bg: string;
  bgHover: string;
  badgeBg: string;
  badgeText: string;
  text: string;
  textMuted: string;
  buttonBg: string;
  buttonBorder: string;
  buttonHoverBg: string;
  buttonText: string;
  activeTabBg: string;
  activeTabBorder: string;
  activeTabText: string;
  avatarBg: string;
  avatarText: string;
  avatarBorder: string;
  glow: string;
}

export const TRACK_THEMES: Record<string, TrackTheme> = {
  'Sobre Nós': {
    primary: '#a855f7',
    primaryHover: '#c084fc',
    dateDay: '#c084fc',
    dateMonth: '#b897e6',
    border: '#a855f7',
    borderSubtle: 'rgba(168, 85, 247, 0.28)',
    bg: 'rgba(168, 85, 247, 0.06)',
    bgHover: 'rgba(168, 85, 247, 0.12)',
    badgeBg: 'rgba(168, 85, 247, 0.2)',
    badgeText: '#f3e8ff',
    text: '#e9d5ff',
    textMuted: '#c4b5d4',
    buttonBg: 'rgba(168, 85, 247, 0.12)',
    buttonBorder: 'rgba(168, 85, 247, 0.45)',
    buttonHoverBg: 'rgba(168, 85, 247, 0.22)',
    buttonText: '#d8b4fe',
    activeTabBg: 'rgba(168, 85, 247, 0.2)',
    activeTabBorder: '#a855f7',
    activeTabText: '#f3e8ff',
    avatarBg: 'rgba(168, 85, 247, 0.3)',
    avatarText: '#f3e8ff',
    avatarBorder: 'rgba(168, 85, 247, 0.55)',
    glow: 'rgba(168, 85, 247, 0.2)',
  },
  'Teoria das Cordas': {
    primary: '#06b6d4',
    primaryHover: '#22d3ee',
    dateDay: '#22d3ee',
    dateMonth: '#7dd3fc',
    border: '#06b6d4',
    borderSubtle: 'rgba(6, 182, 212, 0.28)',
    bg: 'rgba(6, 182, 212, 0.06)',
    bgHover: 'rgba(6, 182, 212, 0.12)',
    badgeBg: 'rgba(6, 182, 212, 0.2)',
    badgeText: '#cffafe',
    text: '#a5f3fc',
    textMuted: '#94a3b8',
    buttonBg: 'rgba(6, 182, 212, 0.12)',
    buttonBorder: 'rgba(6, 182, 212, 0.45)',
    buttonHoverBg: 'rgba(6, 182, 212, 0.22)',
    buttonText: '#67e8f9',
    activeTabBg: 'rgba(6, 182, 212, 0.2)',
    activeTabBorder: '#06b6d4',
    activeTabText: '#cffafe',
    avatarBg: 'rgba(6, 182, 212, 0.3)',
    avatarText: '#cffafe',
    avatarBorder: 'rgba(6, 182, 212, 0.55)',
    glow: 'rgba(6, 182, 212, 0.2)',
  },
};

export const DEFAULT_TRACK_THEME: TrackTheme = {
  primary: '#64748b',
  primaryHover: '#94a3b8',
  dateDay: '#94a3b8',
  dateMonth: '#64748b',
  border: '#64748b',
  borderSubtle: 'rgba(100, 116, 139, 0.28)',
  bg: 'rgba(100, 116, 139, 0.06)',
  bgHover: 'rgba(100, 116, 139, 0.12)',
  badgeBg: 'rgba(100, 116, 139, 0.2)',
  badgeText: '#f1f5f9',
  text: '#cbd5e1',
  textMuted: '#94a3b8',
  buttonBg: 'rgba(100, 116, 139, 0.12)',
  buttonBorder: 'rgba(100, 116, 139, 0.45)',
  buttonHoverBg: 'rgba(100, 116, 139, 0.22)',
  buttonText: '#cbd5e1',
  activeTabBg: 'rgba(100, 116, 139, 0.2)',
  activeTabBorder: '#64748b',
  activeTabText: '#f1f5f9',
  avatarBg: 'rgba(100, 116, 139, 0.3)',
  avatarText: '#f1f5f9',
  avatarBorder: 'rgba(100, 116, 139, 0.55)',
  glow: 'rgba(100, 116, 139, 0.2)',
};

export function getTrackTheme(trackTitle?: string | null): TrackTheme {
  if (!trackTitle) return DEFAULT_TRACK_THEME;
  return TRACK_THEMES[trackTitle] ?? DEFAULT_TRACK_THEME;
}
