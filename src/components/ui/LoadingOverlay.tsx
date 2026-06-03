import React from 'react';
import { Box, Typography } from '@mui/material';
import { colors } from '../../styles/colors';

interface LoadingOverlayProps {
  loading: boolean;
  children: React.ReactNode;
  text?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ loading, children, text }) => {
  return (
    <Box position="relative" width="100%" height="100%">
      <Box sx={{ pointerEvents: loading ? 'none' : 'auto', filter: loading ? 'blur(4px)' : 'none', opacity: loading ? 0.6 : 1, transition: 'filter 0.2s, opacity 0.2s' }}>
        {children}
      </Box>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: colors.bg.overlay,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            pointerEvents: 'auto',
          }}
        >
          {text && (
            <Typography variant="h6" sx={{ color: colors.text.primary, fontWeight: 500 }}>
              {text}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};
