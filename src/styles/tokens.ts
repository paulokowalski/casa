/**
 * Design tokens — fonte única de cores, espaçamentos e medidas do app.
 * Use sempre estes valores (ou o tema do MUI, que é gerado a partir deles)
 * em vez de cores soltas nos componentes.
 */

export const palette = {
  brand: {
    50: '#eff4ff',
    100: '#dbe5ff',
    200: '#b2ccff',
    300: '#84adff',
    500: '#2563eb',
    600: '#1d4ed8',
    700: '#1e40af',
  },
  gray: {
    25: '#fcfcfd',
    50: '#f9fafb',
    100: '#f2f4f7',
    200: '#eaecf0',
    300: '#d0d5dd',
    400: '#98a2b3',
    500: '#667085',
    600: '#475467',
    700: '#344054',
    800: '#1d2939',
    900: '#101828',
  },
  success: { 50: '#ecfdf3', 200: '#abefc6', 500: '#17b26a', 600: '#079455', 700: '#067647' },
  warning: { 50: '#fffaeb', 200: '#fedf89', 500: '#f79009', 600: '#dc6803', 700: '#b54708' },
  error: { 50: '#fef3f2', 200: '#fecdca', 500: '#f04438', 600: '#d92d20', 700: '#b42318' },
  info: { 50: '#ecfdff', 200: '#a5f0fc', 500: '#06aed4', 600: '#088ab2', 700: '#0e7090' },
  violet: { 50: '#f4f3ff', 200: '#d9d6fe', 500: '#7a5af8', 600: '#6938ef', 700: '#5925dc' },
  sidebar: {
    bg: '#0c111d',
    hover: '#161b26',
    active: '#1f242f',
    text: '#cecfd2',
    textMuted: '#94969c',
    accent: '#84adff',
  },
  white: '#ffffff',
} as const;

/** Cores para séries de gráficos (distintas também em luminosidade) */
export const chartPalette = [
  '#1d4ed8',
  '#5ab0f6',
  '#0e9384',
  '#f79009',
  '#7a5af8',
  '#e31b54',
  '#98a2b3',
  '#ea580c',
  '#4f46e5',
  '#0e7090',
];

export const surface = {
  background: '#f5f6f8',
  paper: palette.white,
  subtle: palette.gray[50],
  border: palette.gray[200],
  borderStrong: palette.gray[300],
} as const;

export const text = {
  primary: palette.gray[900],
  secondary: palette.gray[600],
  muted: palette.gray[500],
  inverse: palette.white,
} as const;

export const radius = { sm: 6, md: 8, lg: 12, xl: 16, pill: 999 } as const;

export const shadow = {
  xs: '0 1px 2px rgba(16, 24, 40, 0.05)',
  sm: '0 1px 3px rgba(16, 24, 40, 0.1), 0 1px 2px rgba(16, 24, 40, 0.06)',
  md: '0 4px 8px -2px rgba(16, 24, 40, 0.1), 0 2px 4px -2px rgba(16, 24, 40, 0.06)',
  lg: '0 12px 16px -4px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.03)',
  focus: `0 0 0 4px ${palette.brand[100]}`,
} as const;

export const layout = {
  sidebarWidth: 248,
  railWidth: 72,
  mobileTopBarHeight: 56,
  bottomNavHeight: 64,
  contentMaxWidth: 1600,
} as const;

export const fontFamily = "'Inter', 'Segoe UI', Roboto, Arial, sans-serif";

/** Tons semânticos usados por ícones, pílulas de status e indicadores */
export type Tone = 'brand' | 'success' | 'warning' | 'error' | 'info' | 'violet' | 'neutral';

export const tones: Record<Tone, { bg: string; border: string; fg: string; solid: string }> = {
  brand: { bg: palette.brand[50], border: palette.brand[200], fg: palette.brand[700], solid: palette.brand[600] },
  success: {
    bg: palette.success[50],
    border: palette.success[200],
    fg: palette.success[700],
    solid: palette.success[600],
  },
  warning: {
    bg: palette.warning[50],
    border: palette.warning[200],
    fg: palette.warning[700],
    solid: palette.warning[600],
  },
  error: { bg: palette.error[50], border: palette.error[200], fg: palette.error[700], solid: palette.error[600] },
  info: { bg: palette.info[50], border: palette.info[200], fg: palette.info[700], solid: palette.info[600] },
  violet: { bg: palette.violet[50], border: palette.violet[200], fg: palette.violet[700], solid: palette.violet[600] },
  neutral: { bg: palette.gray[50], border: palette.gray[200], fg: palette.gray[700], solid: palette.gray[500] },
};
