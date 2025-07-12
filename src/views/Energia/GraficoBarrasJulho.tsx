import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useEnergia } from '../../contexts/EnergiaContext';
import { api } from '../../services/api';

const diasJulho = Array.from({ length: 31 }, (_, i) => i + 1);

interface GraficoBarrasJulhoProps {
  onDiaClick?: (dia: number) => void;
  diaSelecionado?: number | null;
}

export function GraficoBarrasJulho({ onDiaClick, diaSelecionado }: GraficoBarrasJulhoProps) {
  const { ano } = useEnergia();
  const [dados, setDados] = useState<{ dia: string, geracao: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ano) return;
    setLoading(true);
    api.get(`/v1/geracao-solar/ano/${ano}/mes/07`)
      .then(res => {
        // Espera-se um objeto { valores: [{ valor, data }], ano, mes }
        const obj = res.data || {};
        const lista = Array.isArray(obj.valores) ? obj.valores : [];
        // Agrupar e somar por dia
        const map: Record<number, number> = {};
        lista.forEach((item: any) => {
          let dia = undefined;
          if (item.data) {
            if (typeof item.data === 'string') {
              const partes = item.data.split('T')[0].split('-');
              if (partes.length === 3) dia = Number(partes[2]);
            } else if (Array.isArray(item.data) && item.data.length >= 3) {
              dia = item.data[2];
            }
          }
          if (typeof dia === 'string') dia = Number(dia);
          if (typeof dia === 'number' && !isNaN(dia)) {
            map[dia] = (map[dia] ?? 0) + (item.valor ?? 0);
          }
        });
        // Montar array final com todos os dias
        const dadosGrafico = diasJulho.map((dia) => ({
          dia: String(dia),
          geracao: map[dia] ?? 0,
        }));
        setDados(dadosGrafico);
      })
      .finally(() => setLoading(false));
  }, [ano]);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ color: '#f5f6fa', mb: 2 }}>
        Geração Diária de Julho ({ano})
      </Typography>
      <Box sx={{ height: 340, background: '#23263a', borderRadius: 2, p: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados} margin={{ top: 16, right: 24, left: 0, bottom: 32 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444857" />
            <XAxis dataKey="dia" tick={{ fill: '#f5f6fa' }} />
            <YAxis tick={{ fill: '#f5f6fa' }} axisLine={{ stroke: '#444857' }} />
            <Tooltip contentStyle={{ background: '#181a20', color: '#f5f6fa', border: '1px solid #6366f1' }} formatter={(v: any) => `${v} kWh`} />
            <Bar dataKey="geracao" fill="#60a5fa" radius={[6, 6, 0, 0]} onClick={(_, idx) => {
              if (onDiaClick) onDiaClick(idx + 1);
            }}>
              {dados.map((entry, idx) => (
                <Cell key={idx} fill={diaSelecionado === idx + 1 ? '#2563eb' : '#60a5fa'} cursor="pointer" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {loading && (
          <Typography align="center" sx={{ mt: 2, color: '#f5f6fa' }}>
            Carregando dados de julho...
          </Typography>
        )}
      </Box>
    </Box>
  );
} 