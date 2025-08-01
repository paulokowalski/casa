import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFinanca } from '../../../contexts/FinancaContext';
import { LoadingCard } from '../../../components/ui/LoadingCard';
import { formatCurrency } from '../../../functions/global';

export function GraficoBarras() {
  const { dadosGraficoAno, loadingGraficoAno } = useFinanca();

  if (loadingGraficoAno) {
    return (
      <Box sx={{ height: 320, background: '#23263a', borderRadius: 2, mt: 2, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingCard title="Gráfico de Receitas e Despesas do Ano" variant="detailed" />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ color: '#f5f6fa', mb: 2 }}>Gráfico de Receitas e Despesas do Ano</Typography>
      <Box sx={{ height: 380, background: '#23263a', borderRadius: 2, mt: 2, p: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dadosGraficoAno} margin={{ top: 16, right: 24, left: 0, bottom: 32 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444857" />
            <XAxis dataKey="mes" style={{ fontWeight: 700, fontSize: 12, fill: '#f5f6fa' }} tick={{ fill: '#f5f6fa' }} />
            <YAxis tickFormatter={(v: number) => formatCurrency(v)} tick={{ fill: '#f5f6fa' }} axisLine={{ stroke: '#444857' }} />
            <Tooltip contentStyle={{ background: '#181a20', color: '#f5f6fa', border: '1px solid #6366f1' }} formatter={(v: number) => formatCurrency(v)} />
            <Legend wrapperStyle={{ color: '#f5f6fa' }} />
            <Bar dataKey="Receita" name="Receita" radius={[8,8,0,0]} fill="#34d399" />
            <Bar dataKey="Despesa" name="Despesa" radius={[8,8,0,0]} fill="#f87171" />
          </BarChart>
        </ResponsiveContainer>
        {loadingGraficoAno && <Typography align="center" sx={{ mt: 2, color: '#f5f6fa' }}>Carregando dados do ano...</Typography>}
      </Box>
    </Box>
  );
} 