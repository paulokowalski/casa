import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useFinanca } from '../../../contexts/FinancaContext';

export function GraficoBarras() {
  const { transacoes, cartaoDespesas } = useFinanca();
  // Agrupar valores por tipo
  const transacoesArray = Array.isArray(transacoes) ? transacoes : [];
  const cartaoArray = Array.isArray(cartaoDespesas) ? cartaoDespesas : [];

  // Soma receitas
  const totalReceita = transacoesArray.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
  // Soma despesas normais
  const totalDespesa = transacoesArray.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);
  // Soma despesas de cartão
  const totalCartao = cartaoArray.reduce((acc, c) => acc + (Number(c.valorParcela) || 0), 0);

  const data = [
    { tipo: 'Receita', valor: totalReceita },
    { tipo: 'Despesa', valor: totalDespesa + totalCartao },
  ];

  return (
    <Box>
      <Typography variant="h6">Gráfico de Receitas, Despesas e Investimentos</Typography>
      <Box sx={{ height: 320, background: '#f5f6fa', borderRadius: 2, mt: 2, p: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="tipo" style={{ fontWeight: 700 }} />
            <YAxis tickFormatter={(v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
            <Tooltip formatter={(v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
            <Legend />
            <Bar dataKey="valor" name="Valor" radius={[8,8,0,0]}
              fill="#667eea"
              label={{ position: 'top', formatter: v => v > 0 ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '' }}
              >
              {data.map((entry, idx) => (
                <Cell key={`cell-${idx}`}
                  fill={entry.tipo === 'Receita' ? '#2e7d32' : '#c62828'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
} 