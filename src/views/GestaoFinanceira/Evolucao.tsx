import { Box, Skeleton, Typography } from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { SectionCard } from '../../components/ui/SectionCard';
import { axisProps, compactNumber, gridProps, tooltipProps, yAxisProps } from '../../components/charts/chartTheme';
import { useGestaoFinanceira } from '../../contexts/GestaoFinanceiraContext';
import { palette } from '../../styles/tokens';
import { formatCurrency } from '../../utils/format';

const COR = { contas: palette.brand[600], contasSoft: palette.brand[200], cartao: '#5ab0f6', cartaoSoft: '#c7e3fc' };

function Legenda({ cor, texto, tracejado }: Readonly<{ cor: string; texto: string; tracejado?: boolean }>) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '0.75rem', color: 'text.secondary' }}>
      {tracejado ? (
        <Box sx={{ width: 14, borderTop: `2px dashed ${cor}` }} />
      ) : (
        <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: cor }} />
      )}
      {texto}
    </Box>
  );
}

/** Contas fixas + cartão nos últimos 12 meses, com a linha da renda */
export function Evolucao() {
  const { visao: v, loading } = useGestaoFinanceira();
  const ultimo = v?.serie.length ? v.serie.length - 1 : -1;

  return (
    <SectionCard
      title="Evolução mês a mês"
      subtitle="Contas fixas + cartão nos últimos 12 meses"
      action={
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Legenda cor={COR.contas} texto="Contas fixas" />
          <Legenda cor={COR.cartao} texto="Cartão" />
          {v?.renda ? <Legenda cor="#12b76a" texto="Renda" tracejado /> : null}
        </Box>
      }
      sx={{ height: '100%' }}
    >
      {loading && !v ? (
        <Skeleton variant="rounded" height={280} />
      ) : !v ? null : (
        <Box sx={{ height: { xs: 250, lg: 360 } }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={v.serie} margin={{ top: 16, right: 4, left: -8, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="rotulo" {...axisProps} interval={0} fontSize={11} />
              <YAxis
                {...yAxisProps}
                width={48}
                tickFormatter={compactNumber}
                domain={[0, (max: number) => Math.ceil((Math.max(max, (v.renda ?? 0) * 1.02) || 1) / 5000) * 5000]}
              />
              <Tooltip
                {...tooltipProps}
                formatter={(valor: number, nome: string) => [
                  formatCurrency(valor),
                  nome === 'contas' ? 'Contas fixas' : 'Cartão',
                ]}
              />
              {v.renda ? <ReferenceLine y={v.renda} stroke="#12b76a" strokeDasharray="6 4" strokeWidth={1.5} /> : null}
              <Bar dataKey="contas" stackId="t" maxBarSize={40}>
                {v.serie.map((p, i) => (
                  <Cell key={p.idx} fill={i === ultimo ? COR.contas : COR.contasSoft} />
                ))}
              </Bar>
              <Bar dataKey="cartao" stackId="t" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {v.serie.map((p, i) => (
                  <Cell key={p.idx} fill={i === ultimo ? COR.cartao : COR.cartaoSoft} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
      {v && v.serie.every((p) => p.total === 0) && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Sem gastos no período.
        </Typography>
      )}
    </SectionCard>
  );
}
