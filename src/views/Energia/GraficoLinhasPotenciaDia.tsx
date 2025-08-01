import { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEnergia } from '../../contexts/EnergiaContext';
import { Card } from '../../components/Card';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import WbSunnyIcon from '@mui/icons-material/WbSunny';

interface Props {
  diaSelecionado: number | null;
}

function MiniCardsInsights({ dados, geracaoDia }: { dados: { horario: string, potencia: number }[], geracaoDia?: number }) {
  if (!dados || dados.length === 0) return null;

  const max = Math.max(...dados.map(d => d.potencia));
  const maxObj = dados.find(d => d.potencia === max);
  const inicioObj = dados.find(d => d.potencia > 0);
  const fimObj = [...dados].reverse().find(d => d.potencia > 0);
  const soma = dados.reduce((acc, d) => acc + d.potencia, 0);
  const media = soma / dados.length;

  function minutosEntre(hora1: string, hora2: string) {
    if (!hora1 || !hora2) return 0;
    const [h1, m1] = hora1.split(':').map(Number);
    const [h2, m2] = hora2.split(':').map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
  }

  function formatarMinutosEmHMS(minutos: number): string {
    const totalSegundos = Math.floor(minutos * 60);
    const horas = Math.floor(totalSegundos / 3600);
    const minutosRestantes = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;

    // Formata para sempre ter dois dígitos
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(horas)}:${pad(minutosRestantes)}:${pad(segundos)}`;
  }

  const minutosGerando = (inicioObj && fimObj)
    ? minutosEntre(inicioObj.horario, fimObj.horario)
    : 0;

  const summaryItems = [
    {
      title: 'Geração (kWh)',
      value: geracaoDia !== undefined ? geracaoDia.toFixed(2) : '--',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      icon: <WbSunnyIcon />,
      description: 'Total do dia',
    },
    {
      title: 'Pico (W)',
      value: max.toFixed(1),
      color: '#fbbf24',
      gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e42 100%)',
      icon: <TrendingUpIcon />,
      description: maxObj?.horario || '--',
    },
    {
      title: 'Média (W)',
      value: media.toFixed(1),
      color: '#60a5fa',
      gradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
      icon: <TrendingDownIcon />,
      description: 'Potência média',
    },
    {
      title: 'Início',
      value: inicioObj?.horario || '--',
      color: '#34d399',
      gradient: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
      icon: <PlayArrowIcon />,
      description: 'Início da geração',
    },
    {
      title: 'Fim',
      value: fimObj?.horario || '--',
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
      icon: <StopIcon />,
      description: 'Fim da geração',
    },
    {
      title: 'Tempo gerando',
      value: minutosGerando > 0 ? formatarMinutosEmHMS(minutosGerando) : '--',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      icon: <AccessTimeIcon />,
      description: 'Duração total',
    },
  ];

  return (
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
        lg: 'repeat(6, 1fr)'
      },
      gap: { xs: 2, md: 3 },
      width: '100%',
      mb: 3,
    }}>
      {summaryItems.map((item, index) => (
        <Card
          key={index}
          gradient={item.gradient}
          className="fade-in-up"
        >
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <span style={{ display: 'flex', alignItems: 'center', color: item.color, fontSize: 18 }}>{item.icon}</span>
              <Typography variant="subtitle2" sx={{ color: item.color, fontWeight: 500, fontSize: '0.95rem', opacity: 0.85 }}>
                {item.title}
              </Typography>
            </Box>
            <Typography 
              variant="h4" 
              component="p" 
              sx={{ 
                color: item.color,
                fontWeight: 700,
                mb: 1,
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                background: item.gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {item.value}
            </Typography>
            {item.description && (
              <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#a0aec0' }}>
                {item.description}
              </Typography>
            )}
          </Box>
        </Card>
      ))}
    </Box>
  );
}

export function GraficoLinhasPotenciaDia({ diaSelecionado }: Props) {
  const { ano, mes, dadosPotenciaDia, geracaoDia, loadingPotencia, carregarDadosPotenciaDia } = useEnergia();

  useEffect(() => {
    if (diaSelecionado) {
      carregarDadosPotenciaDia(diaSelecionado);
    }
  }, [diaSelecionado, carregarDadosPotenciaDia]);

  if (!diaSelecionado) return null;

  // Obter nome do mês para exibição
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const nomeMes = meses[parseInt(mes) - 1] || '';

  return (
    <Box sx={{ mt: 6 }}>
      <MiniCardsInsights dados={dadosPotenciaDia} geracaoDia={geracaoDia} />
      <Typography variant="h6" sx={{ color: '#f5f6fa', mb: 2 }}>
        Potência ao longo do dia {diaSelecionado}/{mes}/{ano} ({nomeMes})
      </Typography>
      <Box sx={{ height: 340, background: '#23263a', borderRadius: 2, p: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dadosPotenciaDia} margin={{ top: 16, right: 24, left: 0, bottom: 32 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444857" />
            <XAxis dataKey="horario" tick={{ fill: '#f5f6fa' }} />
            <YAxis tick={{ fill: '#f5f6fa' }} axisLine={{ stroke: '#444857' }} />
            <Tooltip contentStyle={{ background: '#181a20', color: '#f5f6fa', border: '1px solid #6366f1' }} formatter={(v: any) => `${v} W`} />
            <Line type="monotone" dataKey="potencia" stroke="#fbbf24" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        {loadingPotencia && (
          <Typography align="center" sx={{ mt: 2, color: '#f5f6fa' }}>
            Carregando potência do dia...
          </Typography>
        )}
      </Box>
    </Box>
  );
} 