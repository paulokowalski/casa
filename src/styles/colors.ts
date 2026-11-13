import { chartPalette, palette, surface, text, tones, type Tone } from './tokens';

export const colors = {
  bg: {
    default: surface.background,
    paper: surface.paper,
    elevated: surface.subtle,
  },
  border: {
    default: surface.border,
    light: surface.borderStrong,
  },
  text: {
    primary: text.primary,
    secondary: text.secondary,
    muted: text.muted,
  },
  primary: {
    main: palette.brand[600],
    light: palette.brand[500],
    dark: palette.brand[700],
    subtle: palette.brand[50],
  },
  semantic: {
    success: palette.success[600],
    error: palette.error[600],
    warning: palette.warning[600],
    info: palette.info[600],
  },
  chart: {
    series: chartPalette,
    primary: palette.brand[600],
    primarySoft: palette.brand[200],
    secondary: '#5ab0f6',
    success: palette.success[600],
    warning: palette.warning[500],
    error: palette.error[600],
    violet: palette.violet[600],
    muted: palette.gray[300],
    grid: palette.gray[100],
    axis: palette.gray[200],
  },
} as const;

export { tones, type Tone };
