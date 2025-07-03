import { useContext, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Box, Typography } from '@mui/material';
import { formatCurrency } from '../../../functions/global';
import { GestaoCartaoContext } from '../../../contexts/GestaoCartaoContext';

export function GraficoPorCartao() {
  const { compras } = useContext(GestaoCartaoContext);

  // Agrupa os valores por cartão
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
    return <Typography color="text.secondary">Nenhum gasto encontrado para os cartões selecionados.</Typography>;
  }

  return (
    <Box sx={{ width: '100%', height: 300, display: 'block' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nomeCartao" />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip formatter={(value: number) => [formatCurrency(value), 'Gasto']} />
          <Bar dataKey="valor" name="Gasto Total" fill="#36d1dc" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="valor" position="top" formatter={formatCurrency} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
} 