import React from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { colors, getCardSurfaceSx } from '../../styles/colors';

interface ErrorCardProps {
  error: string | null;
  onRetry?: () => void;
  title?: string;
  variant?: 'default' | 'compact';
}

const cardSx = {
  borderRadius: 2,
  ...getCardSurfaceSx(colors.semantic.error),
  position: 'relative' as const,
  overflow: 'hidden' as const,
};

export const ErrorCard: React.FC<ErrorCardProps> = ({
  error,
  onRetry,
  title = 'Erro',
  variant = 'default',
}) => {
  if (!error) return null;

  if (variant === 'compact') {
    return (
      <Card sx={{ ...cardSx, minWidth: 220, maxWidth: 240, width: '100%', height: 150 }}>
        <CardContent sx={{ p: 2, textAlign: 'center' }}>
          <ErrorOutlineIcon sx={{ fontSize: 32, color: colors.semantic.error, mb: 1 }} />
          <Typography variant="body2" sx={{ color: colors.text.primary, mb: 1 }}>
            {error}
          </Typography>
          {onRetry && (
            <Button
              size="small"
              variant="outlined"
              color="error"
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
    <Card sx={{ ...cardSx, minWidth: 300, maxWidth: 360, width: '100%', height: 260, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <CardContent sx={{ p: 3, textAlign: 'center', py: 2 }}>
        <ErrorOutlineIcon sx={{ fontSize: 48, color: colors.semantic.error, mb: 2 }} />
        <Typography variant="h6" sx={{ color: colors.text.primary }} gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 2 }}>
          {error}
        </Typography>
        {onRetry && (
          <Button
            variant="contained"
            color="error"
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
