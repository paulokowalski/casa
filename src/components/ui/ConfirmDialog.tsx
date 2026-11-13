import type { ReactNode } from 'react';
import { Button, CircularProgress, Typography } from '@mui/material';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
  children?: ReactNode;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  destructive,
  loading,
  error,
  onConfirm,
  onClose,
  children,
}: Readonly<ConfirmDialogProps>) {
  return (
    <Modal
      open={open}
      onClose={loading ? () => undefined : onClose}
      title={title}
      maxWidth="xs"
      actions={
        <>
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color={destructive ? 'error' : 'primary'}
            onClick={onConfirm}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <Typography component="div" variant="body1">
        {description}
      </Typography>
      {children}
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1.5 }} role="alert">
          {error}
        </Typography>
      )}
    </Modal>
  );
}
