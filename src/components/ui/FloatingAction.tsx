import { useEffect, useRef, type ReactNode } from 'react';
import { Box, Fab, Tooltip } from '@mui/material';
import { layout } from '../../styles/tokens';

interface FloatingActionProps {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  /** Tecla de atalho que dispara a ação (padrão: N). `null` desliga. */
  atalho?: string | null;
}

/** Não dispara o atalho enquanto a pessoa digita ou com um modal aberto */
function podeUsarAtalho(e: KeyboardEvent): boolean {
  if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return false;
  const alvo = e.target as HTMLElement | null;
  if (alvo?.closest('input, textarea, select, [contenteditable="true"], [role="combobox"]')) return false;
  return !document.querySelector('[role="dialog"], [role="presentation"].MuiPopover-root');
}

/**
 * Botão flutuante da ação principal da tela (novo registro). Fica sempre no canto inferior direito:
 * com ícone e texto no iPad/desktop e só o ícone no celular, acima da barra de navegação.
 * Inclui um espaço no fim da página para não cobrir a última linha do conteúdo.
 */
export function FloatingAction({ label, icon, onClick, atalho = 'n' }: Readonly<FloatingActionProps>) {
  const acao = useRef(onClick);
  acao.current = onClick;

  useEffect(() => {
    if (!atalho) return;
    const tecla = atalho.toLowerCase();
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === tecla && podeUsarAtalho(e)) {
        e.preventDefault();
        acao.current();
      }
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [atalho]);

  const dica = atalho ? `${label} (atalho: ${atalho.toUpperCase()})` : label;

  return (
    <>
      {/* Espaço no fim da página: o botão nunca cobre a última linha ou a paginação */}
      <Box aria-hidden sx={{ height: { xs: 64, sm: 72 }, flexShrink: 0 }} />
      <Tooltip title={dica} placement="left" describeChild>
        <Fab
          color="primary"
          variant="extended"
          aria-label={label}
          aria-keyshortcuts={atalho ? atalho.toUpperCase() : undefined}
          onClick={onClick}
          sx={{
            position: 'fixed',
            right: { xs: 16, sm: 24, md: 32 },
            bottom: {
              xs: `calc(${layout.bottomNavHeight + 16}px + env(safe-area-inset-bottom))`,
              sm: 24,
              md: 32,
            },
            zIndex: (t) => t.zIndex.appBar,
            height: 56,
            minWidth: 56,
            borderRadius: 4,
            px: { xs: 0, sm: 2.75 },
            gap: 1.25,
            fontSize: '0.9375rem',
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 12px 24px -6px rgba(29,78,216,.45), 0 4px 8px -2px rgba(16,24,40,.12)',
            '& .rotulo': { display: { xs: 'none', sm: 'inline' } },
          }}
        >
          {icon}
          <span className="rotulo">{label}</span>
        </Fab>
      </Tooltip>
    </>
  );
}
