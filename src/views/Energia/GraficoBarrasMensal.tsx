import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEnergia } from '../../contexts/EnergiaContext';

export function GraficoBarrasMensal() {
  const { ano, dadosGeracaoMensal, loadingMensal } = useEnergia();

  console.log(ano, dadosGeracaoMensal, loadingMensal);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ color: '#f5f6fa', mb: 2 }}>
        Geração Mensal de Energia Solar ({ano})
      </Typography>
      <Box sx={{ height: 340, background: '#23263a', borderRadius: 2, p: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dadosGeracaoMensal} margin={{ top: 16, right: 24, left: 0, bottom: 32 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444857" />
            <XAxis dataKey="mes" tick={{ fill: '#f5f6fa' }} />
            <YAxis tick={{ fill: '#f5f6fa' }} axisLine={{ stroke: '#444857' }} />
            <Tooltip contentStyle={{ background: '#181a20', color: '#f5f6fa', border: '1px solid #6366f1' }} formatter={(v: any) => `${v} kWh`} />
            <Bar dataKey="geracao" fill="#34d399" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        {loadingMensal && (
          <Typography align="center" sx={{ mt: 2, color: '#f5f6fa' }}>
            Carregando dados mensais...
          </Typography>
        )}
      </Box>
    </Box>
  );
} 