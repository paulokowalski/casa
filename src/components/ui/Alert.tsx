import React from 'react';
import { Alert as MuiAlert, AlertTitle } from '@mui/material';

interface AlertProps {
  severity: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ severity, title, children, onClose }) => {
  return (
    <MuiAlert
      severity={severity}
      onClose={onClose}
      variant="filled"
      sx={{
        borderRadius: 2,
        fontWeight: 500,
        mb: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        alignItems: 'flex-start',
      }}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {children}
    </MuiAlert>
  );
}; 