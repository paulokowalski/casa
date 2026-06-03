export const colors = {
  bg: {
    default: '#f1f5f9',
    paper: '#ffffff',
    elevated: '#f8fafc',
    overlay: 'rgba(241, 245, 249, 0.9)',
  },
  border: {
    default: '#e2e8f0',
    light: '#cbd5e1',
  },
  text: {
    primary: '#0f172a',
    secondary: '#64748b',
    muted: '#94a3b8',
  },
  primary: {
    main: '#2563eb',
    light: '#3b82f6',
    dark: '#1d4ed8',
    subtle: 'rgba(37, 99, 235, 0.08)',
  },
  semantic: {
    success: '#16a34a',
    error: '#dc2626',
    warning: '#d97706',
    info: '#0284c7',
  },
  chart: {
    blue: '#3b82f6',
    green: '#22c55e',
    amber: '#f59e0b',
    cyan: '#06b6d4',
    red: '#ef4444',
    grid: '#e2e8f0',
    tooltipBg: '#ffffff',
    tooltipBorder: '#e2e8f0',
  },
  cardAccents: {
    blue: {
      color: '#2563eb',
      bg: '#eff6ff',
      border: '#bfdbfe',
      iconBg: 'rgba(37, 99, 235, 0.12)',
    },
    green: {
      color: '#16a34a',
      bg: '#f0fdf4',
      border: '#bbf7d0',
      iconBg: 'rgba(22, 163, 74, 0.12)',
    },
    amber: {
      color: '#d97706',
      bg: '#fffbeb',
      border: '#fde68a',
      iconBg: 'rgba(217, 119, 6, 0.12)',
    },
    cyan: {
      color: '#0891b2',
      bg: '#ecfeff',
      border: '#a5f3fc',
      iconBg: 'rgba(8, 145, 178, 0.12)',
    },
    violet: {
      color: '#7c3aed',
      bg: '#f5f3ff',
      border: '#ddd6fe',
      iconBg: 'rgba(124, 58, 237, 0.12)',
    },
    red: {
      color: '#dc2626',
      bg: '#fef2f2',
      border: '#fecaca',
      iconBg: 'rgba(220, 38, 38, 0.12)',
    },
  },
} as const;

export type CardAccentKey = keyof typeof colors.cardAccents;

const colorToAccent: Record<string, CardAccentKey> = {
  [colors.primary.main]: 'blue',
  [colors.primary.light]: 'blue',
  [colors.semantic.success]: 'green',
  [colors.semantic.error]: 'red',
  [colors.semantic.warning]: 'amber',
  [colors.semantic.info]: 'cyan',
  [colors.chart.cyan]: 'cyan',
  [colors.chart.amber]: 'amber',
  [colors.chart.green]: 'green',
  [colors.chart.red]: 'red',
  [colors.chart.blue]: 'blue',
};

export function resolveCardAccent(colorOrKey: string): (typeof colors.cardAccents)[CardAccentKey] {
  if (colorOrKey in colors.cardAccents) {
    return colors.cardAccents[colorOrKey as CardAccentKey];
  }
  return colors.cardAccents[colorToAccent[colorOrKey] ?? 'blue'];
}

export function getCardSurfaceSx(accentColor: string) {
  const accent = resolveCardAccent(accentColor);
  return {
    background: `linear-gradient(145deg, ${accent.bg} 0%, ${colors.bg.paper} 55%)`,
    border: `1px solid ${accent.border}`,
    borderLeft: `4px solid ${accent.color}`,
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05), 0 4px 12px rgba(15, 23, 42, 0.04)',
  };
}
