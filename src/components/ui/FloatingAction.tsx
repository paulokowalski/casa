import type { ReactNode } from 'react';
import { Fab } from '@mui/material';
import { layout } from '../../styles/tokens';

interface FloatingActionProps {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}

/**
 * Botão flutuante da ação principal — só aparece no celular,
 * acima da barra de navegação inferior. No iPad/desktop a ação fica no PageHeader.
 */
export function FloatingAction({ label, icon, onClick }: Readonly<FloatingActionProps>) {
  return (
    <Fab
      color="primary"
      aria-label={label}
      onClick={onClick}
      sx={{
        display: { xs: 'inline-flex', sm: 'none' },
        position: 'fixed',
        right: 16,
        bottom: `calc(${layout.bottomNavHeight + 16}px + env(safe-area-inset-bottom))`,
        zIndex: (t) => t.zIndex.appBar,
      }}
    >
      {icon}
    </Fab>
  );
}
