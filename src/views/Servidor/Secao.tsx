import type { ReactNode } from 'react';
import { Alert, Box, Typography } from '@mui/material';

interface SecaoProps {
  id: string;
  titulo: string;
  info?: string;
  acao?: ReactNode;
  erro?: string | null;
  children: ReactNode;
}

/** Bloco da tela com título h2, informação à direita (ou uma ação, como o seletor de dia) e erro. */
export function Secao({ id, titulo, info, acao, erro, children }: Readonly<SecaoProps>) {
  return (
    <Box
      component="section"
      aria-labelledby={`titulo-${id}`}
      sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}>
        <Typography id={`titulo-${id}`} component="h2" variant="h4">
          {titulo}
        </Typography>
        {info && <Typography variant="caption">{info}</Typography>}
        {acao}
      </Box>
      {erro && <Alert severity="warning">{erro}</Alert>}
      {children}
    </Box>
  );
}
