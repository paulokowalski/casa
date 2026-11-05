import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Button, Typography } from '@mui/material';

interface State {
  hasError: boolean;
}

/** Evita tela branca: mostra uma mensagem amigável se algum componente quebrar. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erro não tratado na interface:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Ocorreu um erro inesperado
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Tente recarregar a página.
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Recarregar
        </Button>
      </Box>
    );
  }
}
