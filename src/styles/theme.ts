import { createTheme } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';
import { colors } from './colors';

const baseTheme = {
  typography: {
    fontFamily: 'Inter, Manrope, Roboto, Arial, sans-serif',
    fontWeightBold: 700,
    fontWeightMedium: 600,
    fontWeightRegular: 400,
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 600, letterSpacing: '-0.01em' },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: `${colors.border.light} ${colors.bg.default}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
          border: `1px solid ${colors.border.default}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none' as const,
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'background-color 0.2s, box-shadow 0.2s',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.15)',
          },
        },
        containedPrimary: {
          backgroundColor: colors.primary.main,
          '&:hover': {
            backgroundColor: colors.primary.dark,
          },
        },
        outlined: {
          borderColor: colors.border.light,
          '&:hover': {
            borderColor: colors.primary.light,
            backgroundColor: colors.primary.subtle,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: colors.bg.elevated,
            '& fieldset': {
              borderColor: colors.border.default,
            },
            '&:hover fieldset': {
              borderColor: colors.border.light,
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary.light,
            },
          },
          '& .MuiInputBase-input': {
            color: colors.text.primary,
          },
          '& .MuiInputLabel-root': {
            color: colors.text.secondary,
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
          },
        },
        primary: {
          backgroundColor: colors.primary.main,
          '&:hover': {
            backgroundColor: colors.primary.dark,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 6,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: colors.bg.paper,
          border: `1px solid ${colors.border.default}`,
          borderRadius: 10,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: colors.text.primary,
          fontWeight: 600,
          fontSize: '1.1rem',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          color: colors.text.primary,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          borderTop: `1px solid ${colors.border.default}`,
          px: 3,
          py: 2,
        },
      },
    },
  },
};

const lightTheme = createTheme(deepmerge(baseTheme, {
  palette: {
    mode: 'light',
    primary: { main: colors.primary.main, light: colors.primary.light, dark: colors.primary.dark },
    secondary: { main: '#64748b' },
    background: { default: colors.bg.default, paper: colors.bg.paper },
    text: { primary: colors.text.primary, secondary: colors.text.secondary },
    divider: colors.border.default,
    success: { main: colors.semantic.success },
    error: { main: colors.semantic.error },
    info: { main: colors.semantic.info },
    warning: { main: colors.semantic.warning },
  },
}));

const darkTheme = createTheme(deepmerge(baseTheme, {
  palette: {
    mode: 'dark',
    primary: { main: colors.primary.light, light: '#60a5fa', dark: colors.primary.main },
    secondary: { main: colors.text.secondary },
    background: { default: colors.bg.default, paper: colors.bg.paper },
    text: { primary: colors.text.primary, secondary: colors.text.secondary },
    divider: colors.border.default,
    success: { main: colors.semantic.success },
    error: { main: colors.semantic.error },
    info: { main: colors.semantic.info },
    warning: { main: colors.semantic.warning },
  },
}));

export { lightTheme, darkTheme, colors };
