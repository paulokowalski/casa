import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        
        // Aqui você pode adicionar sua lógica de log de erros
        console.error('Erro capturado:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh',
                        padding: 3,
                        textAlign: 'center'
                    }}
                >
                    <Typography variant="h4" color="error" gutterBottom>
                        Ops! Algo deu errado.
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        Desculpe pelo inconveniente. Por favor, tente recarregar a página.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => window.location.reload()}
                        sx={{ mt: 2 }}
                    >
                        Recarregar Página
                    </Button>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <Box sx={{ mt: 4, textAlign: 'left' }}>
                            <Typography variant="h6" color="error" gutterBottom>
                                Detalhes do Erro (apenas em desenvolvimento):
                            </Typography>
                            <pre style={{ 
                                backgroundColor: '#f5f5f5',
                                padding: '1rem',
                                borderRadius: '4px',
                                overflow: 'auto'
                            }}>
                                {this.state.error.toString()}
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </Box>
                    )}
                </Box>
            );
        }

        return this.props.children;
    }
} 