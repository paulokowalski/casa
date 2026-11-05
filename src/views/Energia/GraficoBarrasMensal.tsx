import { Box, Skeleton } from '@mui/material';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SectionCard } from '../../components/ui/SectionCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { axisProps, gridProps, tooltipProps, yAxisProps } from '../../components/charts/chartTheme';
import { useEnergia } from '../../contexts/EnergiaContext';
import { colors } from '../../styles/colors';
import { formatNumber } from '../../utils/format';

export function GraficoBarrasMensal() {
  const { ano, mes, geracaoMensal, loadingMensal } = useEnergia();
  const mesIdx = Number(mes) - 1;
  const temDados = geracaoMensal.some((m) => m.geracao > 0);

  return (
    <SectionCard title="Geração por mês" subtitle={`kWh em ${ano}`}>
      {loadingMensal ? (
        <Skeleton variant="rounded" height={260} />
      ) : !temDados ? (
        <EmptyState message="Sem geração registrada neste ano." />
      ) : (
        <Box sx={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={geracaoMensal} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="mes" {...axisProps} interval={0} fontSize={11} />
              <YAxis {...yAxisProps} width={44} />
              <Tooltip {...tooltipProps} formatter={(v: number) => [`${formatNumber(v, 0)} kWh`, 'Geração']} />
              <Bar dataKey="geracao" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {geracaoMensal.map((m, i) => (
                  <Cell key={m.mes} fill={i === mesIdx ? colors.chart.primary : colors.chart.primarySoft} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </SectionCard>
  );
}
