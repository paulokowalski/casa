import { Box, Skeleton } from '@mui/material';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SectionCard } from '../../components/ui/SectionCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { axisProps, compactNumber, gridProps, tooltipProps, yAxisProps } from '../../components/charts/chartTheme';
import { useGestaoCartao } from '../../contexts/GestaoCartaoContext';
import { colors } from '../../styles/colors';
import { MONTHS_SHORT_PT, capitalize, formatCurrency } from '../../utils/format';

/** Total de despesas por mês do ano da pessoa selecionada. */
export function GraficoDespesasMensais() {
  const { despesasDoAno, loadingAno, filtrosAplicados } = useGestaoCartao();
  const dados = despesasDoAno.map((d) => ({ ...d, rotulo: MONTHS_SHORT_PT[Number(d.mes) - 1] ?? d.mes }));

  return (
    <SectionCard
      title="Despesas por mês"
      subtitle={filtrosAplicados ? `${capitalize(filtrosAplicados.pessoa)} · ${filtrosAplicados.ano}` : undefined}
    >
      {loadingAno ? (
        <Skeleton variant="rounded" height={260} />
      ) : dados.length === 0 ? (
        <EmptyState message="Sem despesas no ano selecionado." />
      ) : (
        <Box sx={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dados} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="rotulo" {...axisProps} interval={0} fontSize={11} />
              <YAxis {...yAxisProps} width={44} tickFormatter={compactNumber} />
              <Tooltip {...tooltipProps} formatter={(v: number) => [formatCurrency(v), 'Total']} />
              <Bar dataKey="valorMes" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {dados.map((d) => (
                  <Cell
                    key={d.mes}
                    fill={d.mes === filtrosAplicados?.mes ? colors.chart.primary : colors.chart.primarySoft}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </SectionCard>
  );
}
