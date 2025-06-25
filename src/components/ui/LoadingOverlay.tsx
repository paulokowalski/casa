import React from 'react';
import { Box, Typography } from '@mui/material';

interface LoadingOverlayProps {
  loading: boolean;
  children: React.ReactNode;
  text?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ loading, children, text }) => {
  return (
    <Box position="relative" width="100%" height="100%">
      <Box sx={{ pointerEvents: loading ? 'none' : 'auto', filter: loading ? 'blur(6px)' : 'none', opacity: loading ? 0.7 : 1, transition: 'filter 0.3s, opacity 0.3s' }}>
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
            bgcolor: 'rgba(255,255,255,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            pointerEvents: 'auto',
            transition: 'background 0.3s',
          }}
        >
          {text && (
            <Typography variant="h6" color="primary" sx={{ fontWeight: 600, textShadow: '0 2px 8px #fff' }}>
              {text}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}; 