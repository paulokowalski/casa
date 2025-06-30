import { createTheme } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';

const baseTheme = {
  typography: {
    fontFamily: 'Manrope, Inter, Roboto, Arial, sans-serif',
    fontWeightBold: 800,
    fontWeightMedium: 600,
    fontWeightRegular: 400,
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(44,62,80,0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none' as const,
          fontWeight: 600,
          background: 'linear-gradient(90deg, #8A05BE 0%, #5327A3 100%)',
          color: '#fff',
          boxShadow: '0 2px 8px rgba(140, 16, 206, 0.18)',
          transition: 'background 0.3s, box-shadow 0.3s, transform 0.1s',
          '&:hover': {
            background: 'linear-gradient(90deg, #A4508B 0%, #5F0A87 100%)',
            boxShadow: '0 4px 16px rgba(140, 16, 206, 0.24)',
            transform: 'translateY(-2px) scale(1.03)',
          },
          '&:active': {
            background: 'linear-gradient(90deg, #5327A3 0%, #8A05BE 100%)',
            boxShadow: '0 1px 4px rgba(140, 16, 206, 0.18)',
            transform: 'scale(0.98)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.45)',
          borderRadius: 10,
          boxShadow: '0 1px 4px rgba(140, 16, 206, 0.06)',
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '& fieldset': {
              borderColor: 'rgba(140, 16, 206, 0.25)',
              borderWidth: 2,
            },
            '&:hover fieldset': {
              borderColor: '#8A05BE',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#8A05BE',
              boxShadow: '0 0 0 2px rgba(140, 16, 206, 0.10)',
            },
            background: 'rgba(255,255,255,0.65)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          },
          '& .MuiInputBase-input': {
            color: '#5327A3',
            fontWeight: 500,
          },
        },
      },
    },
  },
};

const lightTheme = createTheme(deepmerge(baseTheme, {
  palette: {
    mode: 'light',
    primary: { main: '#667eea' },
    secondary: { main: '#764ba2' },
    background: { default: '#f5f6fa', paper: '#fff' },
    text: { primary: '#1a202c', secondary: '#4a5568' },
    success: { main: '#6ee7b7' },
    error: { main: '#fca5a5' },
    info: { main: '#38bdf8' },
    warning: { main: '#fbbf24' },
  },
}));

const darkTheme = createTheme(deepmerge(baseTheme, {
  palette: {
    mode: 'dark',
    primary: { main: '#8b5cf6' },
    secondary: { main: '#38bdf8' },
    background: { default: '#181a20', paper: '#23263a' },
    text: { primary: '#f5f6fa', secondary: '#a0aec0' },
    success: { main: '#34d399' },
    error: { main: '#f87171' },
    info: { main: '#60a5fa' },
    warning: { main: '#fbbf24' },
  },
}));

export { lightTheme, darkTheme }; 