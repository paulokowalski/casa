import { alpha, createTheme } from '@mui/material/styles';
import { fontFamily, palette, radius, shadow, surface, text } from './tokens';

export const ESCALA_DESKTOP = 0.75;

const escalaAtiva = () =>
  typeof window !== 'undefined' && Number(getComputedStyle(document.documentElement).zoom || 1) !== 1;

function ajustarLarguraMenu(paper: HTMLElement) {
  const min = parseFloat(paper.style.minWidth);
  if (min && escalaAtiva()) paper.style.minWidth = `${min * ESCALA_DESKTOP}px`;
}

export const theme = createTheme({
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
  },
  palette: {
    mode: 'light',
    primary: {
      main: palette.brand[600],
      light: palette.brand[500],
      dark: palette.brand[700],
      contrastText: palette.white,
    },
    secondary: { main: palette.gray[700] },
    success: { main: palette.success[600], light: palette.success[50], dark: palette.success[700] },
    warning: { main: palette.warning[600], light: palette.warning[50], dark: palette.warning[700] },
    error: { main: palette.error[600], light: palette.error[50], dark: palette.error[700] },
    info: { main: palette.info[600], light: palette.info[50], dark: palette.info[700] },
    background: { default: surface.background, paper: surface.paper },
    text: { primary: text.primary, secondary: text.secondary, disabled: palette.gray[400] },
    divider: surface.border,
    grey: palette.gray as unknown as Record<string, string>,
  },
  shape: { borderRadius: radius.md },
  typography: {
    fontFamily,
    fontSize: 14,
    h1: { fontSize: '1.875rem', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.25 },
    h2: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.3 },
    h3: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.35 },
    h4: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.45 },
    h6: { fontSize: '0.9375rem', fontWeight: 600, lineHeight: 1.45 },
    subtitle1: { fontSize: '0.9375rem', fontWeight: 500 },
    subtitle2: { fontSize: '0.8125rem', fontWeight: 500, color: text.secondary },
    body1: { fontSize: '0.875rem', lineHeight: 1.5 },
    body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
    caption: { fontSize: '0.75rem', color: text.muted },
    overline: { fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.06em' },
    button: { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' },
        '@media (min-width: 1200px)': {
          html: { zoom: ESCALA_DESKTOP },
          '.MuiPopover-root, .MuiPopper-root': { zoom: 1 / ESCALA_DESKTOP },
          '.MuiPopover-paper > *, .MuiTooltip-tooltip': { zoom: ESCALA_DESKTOP },
        },
        body: { backgroundColor: surface.background, fontVariantNumeric: 'tabular-nums' },
        '*, *::before, *::after': { boxSizing: 'border-box' },
        '::selection': { backgroundColor: palette.brand[100] },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { border: `1px solid ${surface.border}`, borderRadius: radius.lg, boxShadow: shadow.xs },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: radius.md, minHeight: 40, paddingInline: 16 },
        sizeSmall: { minHeight: 32, paddingInline: 12, fontSize: '0.8125rem' },
        outlined: {
          borderColor: surface.borderStrong,
          color: palette.gray[700],
          backgroundColor: palette.white,
          boxShadow: shadow.xs,
          '&:hover': { borderColor: surface.borderStrong, backgroundColor: palette.gray[50] },
          variants: [
            { props: { color: 'error' }, style: { color: palette.error[700], borderColor: palette.error[200] } },
          ],
        },
        text: { '&:hover': { backgroundColor: palette.brand[50] } },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { borderRadius: radius.md, color: palette.gray[500], '&:hover': { backgroundColor: palette.gray[100] } },
      },
    },
    MuiFab: {
      styleOverrides: { root: { boxShadow: `0 8px 20px ${alpha(palette.brand[600], 0.35)}`, borderRadius: radius.xl } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radius.md,
          backgroundColor: palette.white,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: surface.borderStrong },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: palette.gray[400] },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: palette.brand[300], borderWidth: 1 },
          '&.Mui-focused': { boxShadow: shadow.focus },
        },
        input: { '&::placeholder': { color: palette.gray[500], opacity: 1 } },
      },
    },
    MuiInputLabel: { styleOverrides: { root: { color: text.secondary } } },
    MuiSelect: {
      defaultProps: {
        MenuProps: {
          anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
          transformOrigin: { vertical: 'top', horizontal: 'left' },
          slotProps: {
            paper: {
              sx: {
                mt: 0.5,
                boxShadow: shadow.lg,
                border: `1px solid ${surface.border}`,
                '& .MuiMenuItem-root': { textTransform: 'uppercase' },
              },
            },
            transition: { onEntering: ajustarLarguraMenu },
          },
        },
      },
      styleOverrides: { select: { textTransform: 'uppercase' } },
    },
    MuiMenuItem: { styleOverrides: { root: { fontSize: '0.875rem', minHeight: 40 } } },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: radius.pill, fontWeight: 500 },
        sizeSmall: { height: 24, fontSize: '0.75rem' },
      },
    },
    MuiTableContainer: { styleOverrides: { root: { borderRadius: 0 } } },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${surface.border}`,
          fontSize: '0.875rem',
          paddingBlock: 12,
          paddingInline: 16,
        },
        head: {
          backgroundColor: palette.gray[50],
          color: text.secondary,
          fontWeight: 500,
          fontSize: '0.75rem',
          whiteSpace: 'nowrap',
        },
      },
    },
    MuiTableRow: { styleOverrides: { root: { '&.MuiTableRow-hover:hover': { backgroundColor: palette.gray[50] } } } },
    MuiTablePagination: {
      styleOverrides: { root: { borderTop: 'none', color: text.secondary }, toolbar: { minHeight: 52 } },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: radius.lg, boxShadow: shadow.lg, border: `1px solid ${surface.border}` },
      },
    },
    MuiDialogTitle: { styleOverrides: { root: { fontSize: '1.125rem', fontWeight: 600, paddingBottom: 8 } } },
    MuiDialogContent: { styleOverrides: { dividers: { borderColor: surface.border } } },
    MuiDialogActions: { styleOverrides: { root: { padding: '16px 24px', gap: 8 } } },
    MuiTabs: { styleOverrides: { indicator: { height: 2, borderRadius: 2 } } },
    MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, minHeight: 44 } } },
    MuiTooltip: {
      defaultProps: { arrow: true },
      styleOverrides: {
        tooltip: { backgroundColor: palette.gray[900], fontSize: '0.75rem', fontWeight: 500, borderRadius: radius.sm },
        arrow: { color: palette.gray[900] },
      },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: radius.md, alignItems: 'flex-start' } },
    },
    MuiSkeleton: {
      defaultProps: { animation: 'wave' },
      styleOverrides: { root: { backgroundColor: palette.gray[100] } },
    },
    MuiLinearProgress: { styleOverrides: { root: { borderRadius: radius.pill, backgroundColor: palette.gray[100] } } },
  },
});
