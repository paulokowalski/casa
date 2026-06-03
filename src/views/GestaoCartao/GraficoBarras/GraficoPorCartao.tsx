import { useContext, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Box, Typography } from '@mui/material';
import { formatCurrency } from '../../../functions/global';
import { GestaoCartaoContext } from '../../../contexts/GestaoCartaoContext';
import { colors } from '../../../styles/colors';

export function GraficoPorCartao() {
  const { compras } = useContext(GestaoCartaoContext);

  const dados = useMemo(() => {
    const mapa: Record<string, number> = {};
    compras.forEach(compra => {
      if (compra.nomeCartao && compra.valorParcela) {
        mapa[compra.nomeCartao] = (mapa[compra.nomeCartao] || 0) + compra.valorParcela;
      }
    });
    return Object.entries(mapa)
      .map(([nomeCartao, valor]) => ({ nomeCartao, valor }))
      .sort((a, b) => b.valor - a.valor);
  }, [compras]);

  if (!dados.length) {
    return <Typography sx={{ color: colors.text.secondary }}>Nenhum gasto encontrado para os cartões selecionados.</Typography>;
  }

  return (
    <Box sx={{ width: '100%', height: 300, display: 'block', background: colors.bg.paper, border: `1px solid ${colors.border.default}`, borderRadius: 2, p: 2 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.chart.grid} />
          <XAxis dataKey="nomeCartao" tick={{ fill: colors.text.secondary, fontSize: 12 }} />
          <YAxis tickFormatter={formatCurrency} tick={{ fill: colors.text.secondary, fontSize: 12 }} />
          <Tooltip 
            formatter={(value: number) => [formatCurrency(value), 'Gasto']} 
            contentStyle={{ background: colors.chart.tooltipBg, color: colors.text.primary, border: `1px solid ${colors.chart.tooltipBorder}`, borderRadius: 8 }}
          />
          <Bar dataKey="valor" name="Gasto Total" fill={colors.chart.amber} radius={[4, 4, 0, 0]}>
            <LabelList dataKey="valor" position="top" formatter={formatCurrency} fill={colors.text.secondary} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
} 