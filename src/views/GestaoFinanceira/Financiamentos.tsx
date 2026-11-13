import { Box, LinearProgress, Typography } from '@mui/material';
import { SectionCard } from '../../components/ui/SectionCard';
import { StatusPill } from '../../components/ui/StatusPill';
import { useGestaoFinanceira } from '../../contexts/GestaoFinanceiraContext';
import { rotuloMesLongo } from '../../lib/financas/parcelas';
import { palette } from '../../styles/tokens';
import { formatCurrency } from '../../utils/format';

export function Financiamentos() {
  const { visao: v } = useGestaoFinanceira();
  const lista = v?.financiamentos ?? [];
  if (lista.length === 0) return null;

  const saldo = lista.reduce((a, f) => a + f.saldo, 0);
  const porMes = lista.reduce((a, f) => a + f.valor, 0);

  return (
    <SectionCard
      title="Financiamentos e parcelados"
      subtitle="Quanto falta e quando cada um termina"
      action={
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Saldo restante <b style={{ color: palette.gray[900] }}>{formatCurrency(saldo)}</b>
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Por mês <b style={{ color: palette.gray[900] }}>{formatCurrency(porMes)}</b>
          </Typography>
        </Box>
      }
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 2 }}>
        {lista.map((f) => {
          const termina = f.parcela === f.total;
          const pct = f.parcela / f.total;
          return (
            <Box key={f.contaId} sx={{ border: `1px solid ${palette.gray[200]}`, borderRadius: 2.5, p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'flex-start' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {f.descricao}
                </Typography>
                <StatusPill tone={termina ? 'success' : pct >= 0.5 ? 'brand' : 'neutral'}>
                  {termina ? 'Termina agora' : pct >= 0.5 ? 'Mais da metade' : 'Em dia'}
                </StatusPill>
              </Box>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 600, mt: 1 }}>
                {formatCurrency(f.valor)}
                <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
                  {' '}
                  /mês
                </Typography>
              </Typography>
              <LinearProgress
                variant="determinate"
                value={pct * 100}
                color={termina ? 'success' : 'primary'}
                sx={{ height: 8, mt: 1.5 }}
                aria-label={`Parcela ${f.parcela} de ${f.total}`}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Parcela {f.parcela} de {f.total}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {termina ? 'termina este mês' : `termina em ${rotuloMesLongo(f.fimIdx).toLowerCase()}`}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                {termina ? (
                  'Última parcela'
                ) : (
                  <>
                    Restam <b style={{ color: palette.gray[900] }}>{f.restantes}</b> · {formatCurrency(f.saldo)}
                  </>
                )}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </SectionCard>
  );
}
