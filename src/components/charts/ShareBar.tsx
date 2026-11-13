import { Box, Typography } from '@mui/material';
import { chartPalette } from '../../styles/tokens';
import { capitalize, formatCurrency, formatPercent } from '../../utils/format';

export interface ShareItem {
  nome: string;
  valor: number;
}

export function ShareBar({ itens }: Readonly<{ itens: ShareItem[] }>) {
  const positivos = itens.filter((i) => i.valor > 0).sort((a, b) => b.valor - a.valor);
  const total = positivos.reduce((a, i) => a + i.valor, 0) || 1;

  return (
    <Box>
      <Box
        sx={{ display: 'flex', height: 12, borderRadius: 99, overflow: 'hidden', mb: 2, gap: '2px' }}
        role="img"
        aria-label={positivos.map((i) => `${i.nome} ${formatPercent(i.valor / total)}`).join(', ')}
      >
        {positivos.map((i, idx) => (
          <Box
            key={i.nome}
            sx={{ width: `${(i.valor / total) * 100}%`, bgcolor: chartPalette[idx % chartPalette.length] }}
          />
        ))}
      </Box>
      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {positivos.map((i, idx) => (
          <Box component="li" key={i.nome} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '2px',
                flexShrink: 0,
                bgcolor: chartPalette[idx % chartPalette.length],
              }}
            />
            <Typography variant="body2" sx={{ flex: 1, color: 'text.primary' }} noWrap>
              {capitalize(i.nome)}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {formatCurrency(i.valor, true)}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', width: 40, textAlign: 'right' }}>
              {formatPercent(i.valor / total)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
