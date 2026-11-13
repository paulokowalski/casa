import { Box, Skeleton } from '@mui/material';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SectionCard } from '../../components/ui/SectionCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { axisProps, gridProps, tooltipProps, yAxisProps } from '../../components/charts/chartTheme';
import { useEnergia } from '../../contexts/EnergiaContext';
import { colors } from '../../styles/colors';
import { MONTHS_PT, formatNumber } from '../../utils/format';

interface GraficoBarrasDiarioProps {
  diaSelecionado: number | null;
  onDiaClick: (dia: number) => void;
}

export function GraficoBarrasDiario({ diaSelecionado, onDiaClick }: Readonly<GraficoBarrasDiarioProps>) {
  const { ano, mes, geracaoDiaria, loadingDiaria } = useEnergia();
  const temDados = geracaoDiaria.some((d) => d.geracao > 0);

  return (
    <SectionCard
      title="Geração por dia"
      subtitle={`kWh em ${MONTHS_PT[Number(mes) - 1]} de ${ano} · toque em um dia para ver a curva`}
    >
      {loadingDiaria ? (
        <Skeleton variant="rounded" height={260} />
      ) : !temDados ? (
        <EmptyState message="Sem geração registrada neste mês." />
      ) : (
        <Box sx={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={geracaoDiaria} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="dia" {...axisProps} minTickGap={8} />
              <YAxis {...yAxisProps} width={36} />
              <Tooltip
                {...tooltipProps}
                labelFormatter={(d) => `Dia ${d}`}
                formatter={(v) => [`${formatNumber(Number(v))} kWh`, 'Geração']}
              />
              <Bar
                dataKey="geracao"
                radius={[3, 3, 0, 0]}
                onClick={(d) => d?.payload?.dia && onDiaClick(d.payload.dia)}
                style={{ cursor: 'pointer' }}
              >
                {geracaoDiaria.map((d) => (
                  <Cell key={d.dia} fill={d.dia === diaSelecionado ? colors.chart.primary : colors.chart.primarySoft} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </SectionCard>
  );
}
