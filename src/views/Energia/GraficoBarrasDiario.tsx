import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useEnergia } from '../../contexts/EnergiaContext';
import { colors } from '../../styles/colors';

interface GraficoBarrasDiarioProps {
  onDiaClick?: (dia: number) => void;
  diaSelecionado?: number | null;
}

function getNomeMes(mes: number): string {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return meses[mes - 1] || '';
}

export function GraficoBarrasDiario({ onDiaClick, diaSelecionado }: GraficoBarrasDiarioProps) {
  const { ano, mes, dadosGeracaoDiaria, loadingDiaria } = useEnergia();

  if (!ano || !mes) return null;

  const mesNumero = parseInt(mes);
  const nomeMes = getNomeMes(mesNumero);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ color: colors.text.primary, mb: 2, fontWeight: 600 }}>
        Geração Diária de {nomeMes} ({ano})
      </Typography>
      <Box sx={{ height: 340, background: colors.bg.paper, border: `1px solid ${colors.border.default}`, borderRadius: 2, p: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dadosGeracaoDiaria} margin={{ top: 16, right: 24, left: 0, bottom: 32 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.chart.grid} />
            <XAxis dataKey="dia" tick={{ fill: colors.text.secondary, fontSize: 12 }} />
            <YAxis tick={{ fill: colors.text.secondary, fontSize: 12 }} axisLine={{ stroke: colors.chart.grid }} />
            <Tooltip contentStyle={{ background: colors.chart.tooltipBg, color: colors.text.primary, border: `1px solid ${colors.chart.tooltipBorder}`, borderRadius: 8 }} formatter={(v: any) => `${v} kWh`} />
            <Bar dataKey="geracao" fill={colors.primary.light} radius={[4, 4, 0, 0]} onClick={(_, idx) => {
              if (onDiaClick) onDiaClick(idx + 1);
            }}>
              {dadosGeracaoDiaria.map((entry, idx) => (
                <Cell key={idx} fill={diaSelecionado === idx + 1 ? colors.primary.main : colors.primary.light} cursor="pointer" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {loadingDiaria && (
          <Typography align="center" sx={{ mt: 2, color: colors.text.secondary }}>
            Carregando dados de {nomeMes.toLowerCase()}...
          </Typography>
        )}
      </Box>
    </Box>
  );
} 