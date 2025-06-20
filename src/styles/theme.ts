import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f5f5f5', // cor original clara
      paper: '#fff',      // cards brancos
    },
    primary: {
      main: '#1976d2', // azul padrão MUI
      contrastText: '#fff',
    },
    secondary: {
      main: '#9c27b0', // roxo padrão MUI
      contrastText: '#fff',
    },
    info: {
      main: '#0288d1', // azul info padrão
    },
    success: {
      main: '#2e7d32', // verde padrão
    },
    error: {
      main: '#d32f2f', // vermelho padrão
    },
    warning: {
      main: '#ed6c02', // laranja padrão
    },
    text: {
      primary: '#212121', // texto escuro padrão
      secondary: '#757575',
    },
    divider: 'rgba(0,0,0,0.12)',
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    fontWeightBold: 700,
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#fff',
          borderRadius: 8,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#1976d2',
          color: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: '#fff',
          color: '#212121',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          textTransform: 'none',
        },
      },
    },
  },
}); 