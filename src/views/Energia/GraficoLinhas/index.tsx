import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEnergia } from '../../../contexts/EnergiaContext';
import { LoadingCard } from '../../../components/ui/LoadingCard';

export function GraficoLinhas() {
  const { dadosEnergia, loading } = useEnergia();
  const [dadosGrafico, setDadosGrafico] = useState<any[]>([]);

  useEffect(() => {
    if (dadosEnergia && dadosEnergia.length > 0) {
      // Formatar dados para o gráfico
      const dadosFormatados = dadosEnergia.map(dado => ({
        horario: dado.horario,
        Potência: dado.geracao,
      }));
      setDadosGrafico(dadosFormatados);
    } else {
      setDadosGrafico([]);
    }
  }, [dadosEnergia]);

  if (loading) {
    return (
      <Box sx={{ height: 320, background: '#23263a', borderRadius: 2, mt: 2, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingCard title="Gráfico de Energia Solar" variant="detailed" />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ color: '#f5f6fa', mb: 2 }}>Gráfico de Energia Solar</Typography>
      <Box sx={{ height: 380, background: '#23263a', borderRadius: 2, mt: 2, p: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dadosGrafico} margin={{ top: 16, right: 24, left: 0, bottom: 32 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444857" />
            <XAxis dataKey="horario" style={{ fontWeight: 700, fontSize: 12, fill: '#f5f6fa' }} tick={{ fill: '#f5f6fa' }} />
            <YAxis tick={{ fill: '#f5f6fa' }} axisLine={{ stroke: '#444857' }} />
            <Tooltip contentStyle={{ background: '#181a20', color: '#f5f6fa', border: '1px solid #6366f1' }} />
            <Legend wrapperStyle={{ color: '#f5f6fa' }} />
            <Line 
              type="monotone" 
              dataKey="Potência" 
              stroke="#fbbf24" 
              strokeWidth={3}
              dot={{ fill: '#fbbf24', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#fbbf24', strokeWidth: 2, fill: '#fbbf24' }}
            />
          </LineChart>
        </ResponsiveContainer>
        {dadosGrafico.length === 0 && (
          <Typography align="center" sx={{ mt: 2, color: '#f5f6fa' }}>
            Nenhum dado de energia disponível para o período selecionado
          </Typography>
        )}
      </Box>
    </Box>
  );
} 