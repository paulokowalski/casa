import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { layout } from '../styles/tokens';

type Severity = 'success' | 'error' | 'info' | 'warning';

interface ToastContextValue {
  notify: (message: string, severity?: Severity) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [toast, setToast] = useState<{ message: string; severity: Severity; key: number } | null>(null);

  const notify = useCallback((message: string, severity: Severity = 'success') => {
    setToast({ message, severity, key: Date.now() });
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        key={toast?.key}
        open={Boolean(toast)}
        autoHideDuration={3500}
        onClose={(_e, reason) => reason !== 'clickaway' && setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: `calc(${layout.bottomNavHeight + 16}px + env(safe-area-inset-bottom))`, sm: 24 } }}
      >
        {toast ? (
          <Alert severity={toast.severity} variant="filled" onClose={() => setToast(null)} sx={{ minWidth: 280 }}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve ser usado dentro de <ToastProvider>');
  return ctx;
}
