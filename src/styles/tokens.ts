/**
 * Tema Grafite (escuro). Os nomes seguem a escala clara de antes para não mexer nas telas:
 * 25–100 são fundos sutis, 200–300 bordas, 400–500 texto apagado, 600–900 texto.
 * Nas cores de estado, 50 é o fundo, 200 a borda, 500–600 a cor e 700 o texto sobre o fundo 50.
 */
export const palette = {
  brand: {
    50: '#2f2a4a',
    100: '#3a3360',
    200: '#4d4380',
    300: '#8f7fe0',
    500: '#a993ff',
    600: '#b8a4ff',
    700: '#d2c5ff',
  },
  gray: {
    25: '#1c1c22',
    50: '#24242c',
    100: '#2a2a33',
    200: '#35353f',
    300: '#45454f',
    400: '#6f6c80',
    500: '#a5a2b5',
    600: '#cbc8d8',
    700: '#dcdae6',
    800: '#ebe9f2',
    900: '#f1eff7',
  },
  success: { 50: '#1c3330', 200: '#2a5a4c', 500: '#4fd1a5', 600: '#6fe0bb', 700: '#9aefd2' },
  warning: { 50: '#352e20', 200: '#6b5420', 500: '#f5b94a', 600: '#ffd27a', 700: '#ffe2a6' },
  error: { 50: '#402224', 200: '#7a3438', 500: '#ff7a70', 600: '#ff8a80', 700: '#ffb3ab' },
  info: { 50: '#202a40', 200: '#2f4a7a', 500: '#6fa4ff', 600: '#8fb8ff', 700: '#b8d1ff' },
  violet: { 50: '#2f2a4a', 200: '#4d4380', 500: '#a48bff', 600: '#b8a4ff', 700: '#d2c5ff' },
  sidebar: {
    bg: '#101014',
    hover: '#1c1c23',
    active: '#2a2740',
    text: '#e8e6f0',
    textMuted: '#8f8ca0',
    textActive: '#ffffff',
    accent: '#b8a4ff',
  },
  white: '#ffffff',
} as const;

/**
 * Séries dos gráficos, sempre nesta ordem. As 5 primeiras são as cores do Crescimento, conferidas para
 * daltonismo sobre o fundo escuro; da 6ª em diante só para listas longas (o ideal é agrupar em "Outros").
 */
export const chartPalette = [
  '#e0609a',
  '#4a86f0',
  '#b88518',
  '#8f6ff0',
  '#1fa57a',
  '#8f8ca0',
  '#d9733a',
  '#2b9fb3',
  '#c75bd1',
  '#7a8f2e',
];

export const surface = {
  background: '#17171c',
  paper: '#222229',
  subtle: palette.gray[50],
  border: palette.gray[200],
  borderStrong: palette.gray[300],
} as const;

export const text = {
  primary: palette.gray[900],
  secondary: palette.gray[600],
  muted: palette.gray[500],
  inverse: '#17171c',
} as const;

export const radius = { sm: 6, md: 10, lg: 16, xl: 20, pill: 999 } as const;

export const shadow = {
  xs: '0 1px 2px rgba(0, 0, 0, 0.3)',
  sm: '0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 6px 12px -4px rgba(0, 0, 0, 0.5)',
  lg: '0 14px 30px -10px rgba(0, 0, 0, 0.65)',
  focus: `0 0 0 4px ${palette.brand[100]}`,
} as const;

export const layout = {
  sidebarWidth: 248,
  railWidth: 72,
  mobileTopBarHeight: 56,
  bottomNavHeight: 64,
  contentMaxWidth: 1600,
} as const;

export const fontFamily = "'Inter Variable', 'Inter', 'Segoe UI', Roboto, Arial, sans-serif";
/** Títulos arredondados (os mesmos do Crescimento). */
export const fontFamilyTitulo = "'Baloo 2 Variable', 'Inter Variable', 'Segoe UI', Roboto, Arial, sans-serif";

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
