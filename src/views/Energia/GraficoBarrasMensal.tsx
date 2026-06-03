import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEnergia } from '../../contexts/EnergiaContext';
import { colors } from '../../styles/colors';

export function GraficoBarrasMensal() {
  const { ano, dadosGeracaoMensal, loadingMensal } = useEnergia();

  console.log(ano, dadosGeracaoMensal, loadingMensal);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ color: colors.text.primary, mb: 2, fontWeight: 600 }}>
        Geração Mensal de Energia Solar ({ano})
      </Typography>
      <Box sx={{ height: 340, background: colors.bg.paper, border: `1px solid ${colors.border.default}`, borderRadius: 2, p: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dadosGeracaoMensal} margin={{ top: 16, right: 24, left: 0, bottom: 32 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.chart.grid} />
            <XAxis dataKey="mes" tick={{ fill: colors.text.secondary, fontSize: 12 }} />
            <YAxis tick={{ fill: colors.text.secondary, fontSize: 12 }} axisLine={{ stroke: colors.chart.grid }} />
            <Tooltip contentStyle={{ background: colors.chart.tooltipBg, color: colors.text.primary, border: `1px solid ${colors.chart.tooltipBorder}`, borderRadius: 8 }} formatter={(v: any) => `${v} kWh`} />
            <Bar dataKey="geracao" fill={colors.semantic.success} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        {loadingMensal && (
          <Typography align="center" sx={{ mt: 2, color: colors.text.secondary }}>
            Carregando dados mensais...
          </Typography>
        )}
      </Box>
    </Box>
  );
} 