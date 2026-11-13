import { useEffect, useMemo } from 'react';
import { Box, Skeleton } from '@mui/material';
import { Area, AreaChart, CartesianGrid, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import { SectionCard } from '../../components/ui/SectionCard';
import { KpiCard } from '../../components/ui/KpiCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { axisProps, compactNumber, gridProps, tooltipProps, yAxisProps } from '../../components/charts/chartTheme';
import { useEnergia, type PotenciaPonto } from '../../contexts/EnergiaContext';
import { colors } from '../../styles/colors';
import { MONTHS_PT, formatNumber } from '../../utils/format';

const minutos = (h: string) => {
  const [hh, mm] = h.split(':').map(Number);
  return hh * 60 + mm;
};

function resumoDoDia(pontos: PotenciaPonto[]) {
  const validos = pontos.filter((p) => p.horario);
  if (validos.length === 0) return null;
  const pico = validos.reduce((a, b) => (b.potencia > a.potencia ? b : a));
  const gerando = validos.filter((p) => p.potencia > 0);
  const media = validos.reduce((a, p) => a + p.potencia, 0) / validos.length;
  const inicio = gerando[0]?.horario;
  const fim = gerando[gerando.length - 1]?.horario;
  const duracaoMin = inicio && fim ? minutos(fim) - minutos(inicio) : 0;
  return { pico, media, inicio, fim, duracaoMin };
}

const kw = (w: number) => (w >= 1000 ? `${formatNumber(w / 1000)} kW` : `${Math.round(w)} W`);
const duracao = (min: number) => `${Math.floor(min / 60)}h${String(min % 60).padStart(2, '0')}`;

export function GraficoLinhasPotenciaDia({ diaSelecionado }: Readonly<{ diaSelecionado: number | null }>) {
  const { ano, mes, potenciaDia, geracaoDoDia, loadingPotencia, carregarPotenciaDia } = useEnergia();

  useEffect(() => {
    if (diaSelecionado) void carregarPotenciaDia(diaSelecionado);
  }, [diaSelecionado, carregarPotenciaDia]);

  const resumo = useMemo(() => resumoDoDia(potenciaDia), [potenciaDia]);

  if (!diaSelecionado) {
    return (
      <SectionCard title="Curva de potência">
        <EmptyState message="Selecione um dia no gráfico acima para ver a potência ao longo do dia." compact />
      </SectionCard>
    );
  }

  const titulo = `Dia ${diaSelecionado} de ${MONTHS_PT[Number(mes) - 1]} de ${ano}`;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 2.5 } }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
          gap: { xs: 1.5, md: 2.5 },
        }}
      >
        <KpiCard
          label="Geração do dia"
          tone="warning"
          icon={<WbSunnyOutlinedIcon />}
          loading={loadingPotencia}
          value={geracaoDoDia !== null ? `${formatNumber(geracaoDoDia)} kWh` : '—'}
        />
        <KpiCard
          label="Pico de potência"
          tone="brand"
          icon={<BoltOutlinedIcon />}
          loading={loadingPotencia}
          value={resumo ? kw(resumo.pico.potencia) : '—'}
          footer={resumo ? `às ${resumo.pico.horario}` : undefined}
        />
        <KpiCard
          label="Potência média"
          tone="info"
          icon={<SpeedOutlinedIcon />}
          loading={loadingPotencia}
          value={resumo ? kw(resumo.media) : '—'}
        />
        <KpiCard
          label="Tempo gerando"
          tone="success"
          icon={<ScheduleOutlinedIcon />}
          loading={loadingPotencia}
          value={resumo && resumo.duracaoMin > 0 ? duracao(resumo.duracaoMin) : '—'}
          footer={resumo?.inicio ? `${resumo.inicio} – ${resumo.fim}` : undefined}
        />
      </Box>

      <SectionCard title="Curva de potência" subtitle={titulo}>
        {loadingPotencia ? (
          <Skeleton variant="rounded" height={280} />
        ) : potenciaDia.length === 0 ? (
          <EmptyState message="Nenhuma leitura de potência neste dia." />
        ) : (
          <Box sx={{ height: { xs: 220, md: 280 } }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={potenciaDia} margin={{ top: 12, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="energiaArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors.chart.primary} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={colors.chart.primary} stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="horario" {...axisProps} minTickGap={28} />
                <YAxis {...yAxisProps} width={44} tickFormatter={(v: number) => `${compactNumber(v)}`} unit="W" />
                <Tooltip {...tooltipProps} formatter={(v) => [kw(Number(v)), 'Potência']} />
                <Area
                  type="monotone"
                  dataKey="potencia"
                  stroke={colors.chart.primary}
                  strokeWidth={2.5}
                  fill="url(#energiaArea)"
                />
                {resumo && (
                  <ReferenceDot
                    x={resumo.pico.horario}
                    y={resumo.pico.potencia}
                    r={5}
                    fill="#fff"
                    stroke={colors.chart.primary}
                    strokeWidth={2.5}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        )}
      </SectionCard>
    </Box>
  );
}
