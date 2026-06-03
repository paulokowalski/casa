import { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEnergia } from '../../contexts/EnergiaContext';
import { Card } from '../../components/Card';
import { colors } from '../../styles/colors';
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
      color: colors.semantic.success,
      accent: colors.semantic.success,
      icon: <WbSunnyIcon />,
      description: 'Total do dia',
    },
    {
      title: 'Pico (W)',
      value: max.toFixed(1),
      color: colors.semantic.warning,
      accent: colors.semantic.warning,
      icon: <TrendingUpIcon />,
      description: maxObj?.horario || '--',
    },
    {
      title: 'Média (W)',
      value: media.toFixed(1),
      color: colors.primary.light,
      accent: colors.primary.light,
      icon: <TrendingDownIcon />,
      description: 'Potência média',
    },
    {
      title: 'Início',
      value: inicioObj?.horario || '--',
      color: colors.semantic.success,
      accent: colors.semantic.success,
      icon: <PlayArrowIcon />,
      description: 'Início da geração',
    },
    {
      title: 'Fim',
      value: fimObj?.horario || '--',
      color: colors.semantic.error,
      accent: colors.semantic.error,
      icon: <StopIcon />,
      description: 'Fim da geração',
    },
    {
      title: 'Tempo gerando',
      value: minutosGerando > 0 ? formatarMinutosEmHMS(minutosGerando) : '--',
      color: colors.semantic.warning,
      accent: colors.semantic.warning,
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
          gradient={item.accent}
          className="fade-in-up"
        >
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 0.5, px: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Box sx={{ color: item.color, display: 'flex', '& svg': { fontSize: 18 } }}>{item.icon}</Box>
              <Typography variant="subtitle2" sx={{ color: colors.text.secondary, fontWeight: 500, fontSize: '0.875rem' }}>
                {item.title}
              </Typography>
            </Box>
            <Typography
              variant="h5"
              component="p"
              sx={{
                color: item.color,
                fontWeight: 700,
                mb: 0.5,
                fontSize: { xs: '1.1rem', md: '1.35rem' },
              }}
            >
              {item.value}
            </Typography>
            {item.description && (
              <Typography variant="caption" sx={{ fontSize: '0.75rem', color: colors.text.muted }}>
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
      <Typography variant="h6" sx={{ color: colors.text.primary, mb: 2, fontWeight: 600 }}>
        Potência ao longo do dia {diaSelecionado}/{mes}/{ano} ({nomeMes})
      </Typography>
      <Box sx={{ height: 340, background: colors.bg.paper, border: `1px solid ${colors.border.default}`, borderRadius: 2, p: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dadosPotenciaDia} margin={{ top: 16, right: 24, left: 0, bottom: 32 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.chart.grid} />
            <XAxis dataKey="horario" tick={{ fill: colors.text.secondary, fontSize: 12 }} />
            <YAxis tick={{ fill: colors.text.secondary, fontSize: 12 }} axisLine={{ stroke: colors.chart.grid }} />
            <Tooltip contentStyle={{ background: colors.chart.tooltipBg, color: colors.text.primary, border: `1px solid ${colors.chart.tooltipBorder}`, borderRadius: 8 }} formatter={(v: any) => `${v} W`} />
            <Line type="monotone" dataKey="potencia" stroke={colors.chart.amber} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        {loadingPotencia && (
          <Typography align="center" sx={{ mt: 2, color: colors.text.secondary }}>
            Carregando potência do dia...
          </Typography>
        )}
      </Box>
    </Box>
  );
} 