import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#e0e7ff',
      paper: 'rgba(255, 255, 255, 0.97)',
    },
    primary: {
      main: '#a5b4fc',
      light: '#dbeafe',
      dark: '#818cf8',
      contrastText: '#1a202c',
    },
    secondary: {
      main: '#c4b5fd',
      light: '#ede9fe',
      dark: '#a78bfa',
      contrastText: '#1a202c',
    },
    info: {
      main: '#bae6fd',
      light: '#e0f2fe',
      dark: '#7dd3fc',
    },
    success: {
      main: '#6ee7b7',
      light: '#d1fae5',
      dark: '#34d399',
    },
    error: {
      main: '#fca5a5',
      light: '#fee2e2',
      dark: '#f87171',
    },
    warning: {
      main: '#fde68a',
      light: '#fef9c3',
      dark: '#fbbf24',
    },
    text: {
      primary: '#1a202c',
      secondary: '#4a5568',
    },
    divider: 'rgba(102, 126, 234, 0.08)',
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeightBold: 700,
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
      color: '#1a202c',
      textShadow: 'none',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      color: '#1a202c',
      textShadow: 'none',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#1a202c',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#1a202c',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
      color: '#1a202c',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      color: '#1a202c',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#1a202c',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#4a5568',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.97)',
          backdropFilter: 'blur(20px)',
          borderRadius: 10,
          border: '1px solid #e0e7ef',
          boxShadow: '0 4px 20px rgba(44,62,80,0.06)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          color: '#1a202c',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#1a202c',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 600,
          textTransform: 'none',
          padding: '10px 22px',
          fontSize: '0.95rem',
          background: 'none',
        },
        contained: {
          background: '#a5b4fc',
          color: '#1a202c',
          '&:hover': {
            background: '#dbeafe',
          },
        },
        outlined: {
          border: '2px solid',
          background: '#fff',
          color: '#1a202c',
          '&:hover': {
            background: '#f3f4f6',
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          background: '#667eea',
          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
          '&:hover': {
            background: '#5a6fd8',
            transform: 'scale(1.05)',
            boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.97)',
          borderRadius: 10,
          border: '1px solid #e0e7ef',
          boxShadow: '0 4px 20px rgba(44,62,80,0.06)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            background: 'rgba(102, 126, 234, 0.1)',
            transform: 'translateX(4px)',
          },
          '&.Mui-selected': {
            background: '#667eea',
            color: '#ffffff',
            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
            '&:hover': {
              background: '#5a6fd8',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
          fontSize: '0.80rem',
          background: '#fff',
          color: '#1a202c',
          borderWidth: 2,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#667eea',
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#667eea',
                borderWidth: 2,
              },
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 10,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiSnackbarContent-root': {
            borderRadius: 8,
            background: '#667eea',
            color: '#ffffff',
            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 500,
          fontSize: '1rem',
          background: '#fff',
          color: '#1a202c',
          border: '1px solid #e0e7ef',
        },
        standardError: {
          background: '#fee2e2',
          color: '#b91c1c',
        },
        standardSuccess: {
          background: '#d1fae5',
          color: '#065f46',
        },
        standardWarning: {
          background: '#fef9c3',
          color: '#92400e',
        },
        standardInfo: {
          background: '#e0f2fe',
          color: '#0369a1',
        },
      },
    },
  },
}); 