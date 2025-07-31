import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEnergia } from '../../contexts/EnergiaContext';
import { api } from '../../services/api';

const mesesPt = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
const mesesEn = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

export function GraficoBarrasMensal() {
  const { ano } = useEnergia();
  const [dados, setDados] = useState<{ mes: string, geracao: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ano) return;
    setLoading(true);
    api.get(`/v1/geracao-solar/ano/${ano}`)
      .then(res => {
        const lista = Array.isArray(res.data) ? res.data : [];
        const map: Record<string, number> = {};
        lista.forEach((item: any) => {
          let idx = -1;
          if (typeof item.month === 'string') {
            idx = mesesEn.indexOf(item.month.toUpperCase());
          } else if (typeof item.month === 'number') {
            idx = item.month - 1;
          }
          if (idx >= 0) {
            map[idx] = item.value ?? 0;
          }
        });
        const dadosGrafico = mesesPt.map((mes, idx) => ({
          mes,
          geracao: map[idx] ?? 0,
        }));
        setDados(dadosGrafico);
      })
      .finally(() => setLoading(false));
  }, [ano]);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ color: '#f5f6fa', mb: 2 }}>
        Geração Mensal de Energia Solar ({ano})
      </Typography>
      <Box sx={{ height: 340, background: '#23263a', borderRadius: 2, p: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados} margin={{ top: 16, right: 24, left: 0, bottom: 32 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444857" />
            <XAxis dataKey="mes" tick={{ fill: '#f5f6fa' }} />
            <YAxis tick={{ fill: '#f5f6fa' }} axisLine={{ stroke: '#444857' }} />
            <Tooltip contentStyle={{ background: '#181a20', color: '#f5f6fa', border: '1px solid #6366f1' }} formatter={(v: any) => `${v} kWh`} />
            <Bar dataKey="geracao" fill="#34d399" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        {loading && (
          <Typography align="center" sx={{ mt: 2, color: '#f5f6fa' }}>
            Carregando dados mensais...
          </Typography>
        )}
      </Box>
    </Box>
  );
} 