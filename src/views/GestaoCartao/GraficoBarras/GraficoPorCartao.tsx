import { useContext, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Box, Typography } from '@mui/material';
import { formatCurrency } from '../../../functions/global';
import { GestaoCartaoContext } from '../../../contexts/GestaoCartaoContext';

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
    return <Typography sx={{ color: '#a0aec0' }}>Nenhum gasto encontrado para os cartões selecionados.</Typography>;
  }

  return (
    <Box sx={{ width: '100%', height: 300, display: 'block', background: '#23263a', borderRadius: 2, p: 2 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444857" />
          <XAxis dataKey="nomeCartao" tick={{ fill: '#f5f6fa' }} />
          <YAxis tickFormatter={formatCurrency} tick={{ fill: '#f5f6fa' }} />
          <Tooltip 
            formatter={(value: number) => [formatCurrency(value), 'Gasto']} 
            contentStyle={{ background: '#181a20', color: '#f5f6fa', border: '1px solid #6366f1' }}
          />
          <Bar dataKey="valor" name="Gasto Total" fill="#f59e0b" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="valor" position="top" formatter={formatCurrency} fill="#f5f6fa" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
} 