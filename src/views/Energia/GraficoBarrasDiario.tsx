import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useEnergia } from '../../contexts/EnergiaContext';

interface GraficoBarrasDiarioProps {
  onDiaClick?: (dia: number) => void;
  diaSelecionado?: number | null;
}

function getNomeMes(mes: number): string {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return meses[mes - 1] || '';
}

export function GraficoBarrasDiario({ onDiaClick, diaSelecionado }: GraficoBarrasDiarioProps) {
  const { ano, mes, dadosGeracaoDiaria, loadingDiaria } = useEnergia();

  if (!ano || !mes) return null;

  const mesNumero = parseInt(mes);
  const nomeMes = getNomeMes(mesNumero);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ color: '#f5f6fa', mb: 2 }}>
        Geração Diária de {nomeMes} ({ano})
      </Typography>
      <Box sx={{ height: 340, background: '#23263a', borderRadius: 2, p: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dadosGeracaoDiaria} margin={{ top: 16, right: 24, left: 0, bottom: 32 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444857" />
            <XAxis dataKey="dia" tick={{ fill: '#f5f6fa' }} />
            <YAxis tick={{ fill: '#f5f6fa' }} axisLine={{ stroke: '#444857' }} />
            <Tooltip contentStyle={{ background: '#181a20', color: '#f5f6fa', border: '1px solid #6366f1' }} formatter={(v: any) => `${v} kWh`} />
            <Bar dataKey="geracao" fill="#60a5fa" radius={[6, 6, 0, 0]} onClick={(_, idx) => {
              if (onDiaClick) onDiaClick(idx + 1);
            }}>
              {dadosGeracaoDiaria.map((entry, idx) => (
                <Cell key={idx} fill={diaSelecionado === idx + 1 ? '#2563eb' : '#60a5fa'} cursor="pointer" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {loadingDiaria && (
          <Typography align="center" sx={{ mt: 2, color: '#f5f6fa' }}>
            Carregando dados de {nomeMes.toLowerCase()}...
          </Typography>
        )}
      </Box>
    </Box>
  );
} 