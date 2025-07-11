import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ptBR } from '@mui/material/locale';
import { lightTheme } from './styles/theme';
import App from './App';
import { ThemeModeProvider, useThemeMode } from './contexts/ThemeContext';

function Main() {
  const { theme } = useThemeMode();
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ThemeModeProvider>
      <Main />
    </ThemeModeProvider>
  </React.StrictMode>
);