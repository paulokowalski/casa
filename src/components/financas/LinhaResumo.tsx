import { Box } from '@mui/material';

interface LinhaResumoProps {
  rotulo: string;
  valor: string;
  forte?: boolean;
  riscado?: boolean;
  cor?: string;
}

export function LinhaResumo({ rotulo, valor, forte, riscado, cor }: Readonly<LinhaResumoProps>) {
  return (
    <Box
      sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, fontSize: '0.8125rem', color: 'text.secondary' }}
    >
      <span>{rotulo}</span>
      <Box
        component="span"
        sx={{
          fontWeight: forte ? 700 : 600,
          textDecoration: riscado ? 'line-through' : 'none',
          color: cor ?? (riscado ? 'text.secondary' : 'text.primary'),
          textAlign: 'right',
        }}
      >
        {valor}
      </Box>
    </Box>
  );
}
