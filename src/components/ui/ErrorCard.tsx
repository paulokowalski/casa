import React from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface ErrorCardProps {
  error: string | null;
  onRetry?: () => void;
  title?: string;
  variant?: 'default' | 'compact';
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
  error,
  onRetry,
  title = 'Erro',
  variant = 'default',
}) => {
  if (!error) return null;

  if (variant === 'compact') {
    return (
      <Card
        sx={{
          minWidth: 220,
          maxWidth: 240,
          width: '100%',
          height: 150,
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
          },
        }}
      >
        <CardContent sx={{ p: 2, textAlign: 'center' }}>
          <ErrorOutlineIcon sx={{ fontSize: 32, color: '#ef4444', mb: 1 }} />
          <Typography variant="body2" sx={{ color: '#1a202c', mb: 1 }}>
            {error}
          </Typography>
          {onRetry && (
            <Button
              size="small"
              variant="outlined"
              sx={{
                color: '#ef4444',
                borderColor: '#ef4444',
                '&:hover': {
                  borderColor: '#dc2626',
                  background: 'rgba(239, 68, 68, 0.1)',
                },
              }}
              startIcon={<RefreshIcon />}
              onClick={onRetry}
            >
              Tentar
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        minWidth: 300,
        maxWidth: 360,
        width: '100%',
        height: 260,
        borderRadius: 2,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
        },
      }}
    >
      <CardContent sx={{ p: 3, textAlign: 'center' }}>
        <ErrorOutlineIcon sx={{ fontSize: 48, color: '#ef4444', mb: 2 }} />
        <Typography variant="h6" sx={{ color: '#1a202c' }} gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: '#4a5568', mb: 2 }}>
          {error}
        </Typography>
        {onRetry && (
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
              color: '#ffffff',
              mt: 1,
              '&:hover': {
                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
              },
            }}
            startIcon={<RefreshIcon />}
            onClick={onRetry}
          >
            Tentar Novamente
          </Button>
        )}
      </CardContent>
    </Card>
  );
}; 