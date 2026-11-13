import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

interface EmptyStateProps {
  message: string;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({ message, action, compact }: Readonly<EmptyStateProps>) {
  return (
    <Box
      sx={{
        py: compact ? 2 : 5,
        px: 2,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        {message}
      </Typography>
      {action}
    </Box>
  );
}
