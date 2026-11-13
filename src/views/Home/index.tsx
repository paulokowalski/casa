import { useState, type ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  InputAdornment,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader } from '../../components/ui/PageHeader';
import { KpiCard } from '../../components/ui/KpiCard';
import { SectionCard } from '../../components/ui/SectionCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { IconBadge } from '../../components/ui/IconBadge';
import { StatusPill, TrendPill } from '../../components/ui/StatusPill';
import { axisProps, gridProps, tooltipProps, yAxisProps } from '../../components/charts/chartTheme';
import { colors } from '../../styles/colors';
import { palette, type Tone } from '../../styles/tokens';
import { MONTHS_PT, MONTHS_SHORT_PT, formatCurrency, formatNumber, parseCurrency } from '../../utils/format';
import { TARIFA_PADRAO, useDashboardData, type Cambio, type InsightDia } from './useDashboardData';

const kwh = (v: number, casas = 1) => `${formatNumber(v, casas)} kWh`;
const quatroCasas = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
const kw = (w: number) => (w >= 1000 ? `${formatNumber(w / 1000)} kW` : `${Math.round(w)} W`);

function saudacao(hora: number) {
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

const ICONES: Record<InsightDia['icone'], ReactNode> = {
  sol: <WbSunnyOutlinedIcon />,
  grafico: <ShowChartIcon />,
  dolar: <AttachMoneyIcon />,
  carro: <DirectionsCarFilledOutlinedIcon />,
  trofeu: <EmojiEventsOutlinedIcon />,
};
const TOM: Record<InsightDia['tom'], Tone> = { bom: 'success', ruim: 'error', neutro: 'neutral', info: 'warning' };

function ResumoDoDia({ insights, carregando }: Readonly<{ insights: InsightDia[]; carregando: boolean }>) {
  return (
    <SectionCard
      title="Resumo do dia"
      action={insights.length > 0 ? <StatusPill>{insights.length} alertas</StatusPill> : undefined}
      sx={{ height: '100%' }}
    >
      {carregando && insights.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={48} />
          ))}
        </Box>
      ) : insights.length === 0 ? (
        <EmptyState message="Sem dados suficientes para o resumo de hoje." compact />
      ) : (
        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {insights.map((i, idx) => (
            <Box
              component="li"
              key={i.id}
              sx={{
                display: 'flex',
                gap: 1.5,
                py: 1.5,
                borderTop: idx === 0 ? 0 : 1,
                borderColor: 'divider',
                '&:first-of-type': { pt: 0 },
              }}
            >
              <IconBadge tone={TOM[i.tom]}>{ICONES[i.icone]}</IconBadge>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600 }}>{i.titulo}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                  {i.texto}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </SectionCard>
  );
}

function Tarifa({ tarifa, setTarifa }: Readonly<{ tarifa: number; setTarifa: (v: number) => void }>) {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState('');

  if (!editando) {
    return (
      <Tooltip title="Valor pago por kWh na conta de luz (fica salvo neste navegador)">
        <Button
          size="small"
          variant="text"
          onClick={() => {
            setTexto(tarifa.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
            setEditando(true);
          }}
          endIcon={<EditOutlinedIcon sx={{ fontSize: '14px !important' }} />}
          sx={{ minHeight: 28, px: 0.5, color: 'text.secondary', fontWeight: 500, fontSize: '0.8125rem' }}
        >
          tarifa {formatCurrency(tarifa)}
          {tarifa === TARIFA_PADRAO ? ' (estimada)' : ''}
        </Button>
      </Tooltip>
    );
  }

  const salvar = () => {
    const v = parseCurrency(texto);
    if (v > 0) setTarifa(v);
    setEditando(false);
  };
  return (
    <TextField
      size="small"
      autoFocus
      label="Tarifa por kWh"
      value={texto}
      onChange={(e) => setTexto(e.target.value.replace(/[^\d,]/g, ''))}
      onBlur={salvar}
      onKeyDown={(e) => {
        if (e.key === 'Enter') salvar();
        if (e.key === 'Escape') setEditando(false);
      }}
      slotProps={{
        htmlInput: { inputMode: 'decimal' },
        input: { startAdornment: <InputAdornment position="start">R$</InputAdornment> },
      }}
      sx={{ maxWidth: 170 }}
    />
  );
}

function LinhaCambio({ c }: Readonly<{ c: Cambio }>) {
  const faixa = c.maximo - c.minimo;
  const pos = faixa > 0 ? Math.min(100, Math.max(0, ((c.valor - c.minimo) / faixa) * 100)) : 50;
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25, flexWrap: 'wrap' }}>
        <Typography sx={{ fontWeight: 600, flex: 1, minWidth: 100 }}>
          {c.codigo === 'USD' ? 'Dólar (USD)' : 'Euro (EUR)'}
        </Typography>
        <Typography sx={{ fontSize: '1.125rem', fontWeight: 600 }}>R$ {quatroCasas(c.valor)}</Typography>
        <TrendPill value={c.variacao / 100} positiveIsGood={false} />
      </Box>
      <Box
        role="img"
        aria-label={`Cotação entre a mínima de R$ ${quatroCasas(c.minimo)} e a máxima de R$ ${quatroCasas(c.maximo)}`}
        sx={{ position: 'relative', height: 6, borderRadius: 99, bgcolor: palette.gray[100] }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: `calc(${pos}% - 2px)`,
            top: -5,
            width: 4,
            height: 16,
            borderRadius: 1,
            bgcolor: palette.brand[600],
          }}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.75 }}>
        <Typography variant="caption">mín R$ {quatroCasas(c.minimo)}</Typography>
        <Typography variant="caption">máx R$ {quatroCasas(c.maximo)}</Typography>
      </Box>
    </Box>
  );
}

export function Home() {
  const d = useDashboardData();
  const theme = useTheme();
  const celular = useMediaQuery(theme.breakpoints.down('sm'));
  const { hoje } = d;

  const dataLonga = new Date(hoje.ano, hoje.mes - 1, hoje.dia).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const ratioHoje =
    d.solarHoje?.kwh != null && d.solarMes?.mediaDiaria ? d.solarHoje.kwh / d.solarMes.mediaDiaria - 1 : null;
  const economiaMes = d.solarMes ? d.solarMes.acumulado * d.tarifa : null;
  const economiaAno = d.solarAno ? d.solarAno.atual.reduce((a, b) => a + b, 0) * d.tarifa : null;
  const ytd =
    d.solarAno && d.solarAno.ytdAnterior > 0
      ? (d.solarAno.ytdAtual - d.solarAno.ytdAnterior) / d.solarAno.ytdAnterior
      : null;
  const dadosAno = d.solarAno
    ? MONTHS_SHORT_PT.map((m, i) => ({
        mes: m,
        atual: i < hoje.mes ? d.solarAno!.atual[i] : null,
        anterior: d.solarAno!.anterior[i],
      }))
    : [];

  const grade = (colunas: object) => ({
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', ...colunas },
    gap: { xs: 2, md: 2.5 },
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>
      <PageHeader
        title={saudacao(new Date().getHours())}
        subtitle={`${dataLonga} · resumo da casa`}
        actions={
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={d.recarregar}>
            Atualizar
          </Button>
        }
      />

      <Box
        component="section"
        aria-label="Indicadores"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
          gap: { xs: 1.5, md: 2.5 },
        }}
      >
        <KpiCard
          label="Geração solar hoje"
          icon={<WbSunnyOutlinedIcon />}
          tone="warning"
          loading={d.hojeStatus === 'loading'}
          value={d.solarHoje?.kwh != null ? kwh(d.solarHoje.kwh) : '—'}
          footer={
            ratioHoje !== null ? (
              <>
                <TrendPill value={ratioHoje} positiveIsGood />
                <span>vs média do mês</span>
              </>
            ) : d.hojeStatus === 'erro' ? (
              'Não foi possível carregar'
            ) : undefined
          }
        />
        <KpiCard
          label="Economia solar no mês"
          icon={<SavingsOutlinedIcon />}
          tone="success"
          loading={d.mesStatus === 'loading'}
          value={economiaMes !== null ? formatCurrency(economiaMes) : '—'}
          footer={
            <>
              {economiaAno ? <StatusPill>{formatCurrency(economiaAno, true)} no ano</StatusPill> : null}
              <Tarifa tarifa={d.tarifa} setTarifa={d.setTarifa} />
            </>
          }
        />
        <KpiCard
          label="Dólar comercial"
          icon={<CurrencyExchangeIcon />}
          tone="brand"
          loading={d.cambioStatus === 'loading'}
          value={d.cambios.dolar ? `R$ ${quatroCasas(d.cambios.dolar.valor)}` : '—'}
          footer={
            <>
              {d.cambios.dolar && <TrendPill value={d.cambios.dolar.variacao / 100} positiveIsGood={false} />}
              {d.cambios.euro && <span>Euro R$ {quatroCasas(d.cambios.euro.valor)}</span>}
            </>
          }
        />
        <KpiCard
          label="Carro · FIPE"
          icon={<DirectionsCarFilledOutlinedIcon />}
          tone="violet"
          loading={d.fipeAtualStatus === 'loading'}
          value={
            d.fipeAtual?.price
              ? formatCurrency(parseCurrency(d.fipeAtual.price), true)
              : d.fipe?.atual
                ? formatCurrency(d.fipe.atual, true)
                : '—'
          }
          footer={d.fipeAtual ? `${d.fipeAtual.brand} ${d.fipeAtual.model}` : d.fipe?.descricao}
        />
      </Box>

      <Box sx={grade({ lg: 'minmax(320px, 1fr) minmax(0, 2fr)' })}>
        <ResumoDoDia insights={d.insights} carregando={d.carregandoResumo} />
        <SectionCard
          title="Potência solar hoje"
          subtitle={
            d.solarHoje?.pico ? (
              <>
                Pico de <b>{kw(d.solarHoje.pico.potencia)}</b> às {d.solarHoje.pico.horario}
                {d.solarHoje.agora &&
                  ` · última leitura ${kw(d.solarHoje.agora.potencia)} às ${d.solarHoje.agora.horario}`}
              </>
            ) : (
              'Curva de potência ao longo do dia'
            )
          }
          action={
            <Button component={RouterLink} to="/energia" size="small" variant="text">
              Ver Energia Solar
            </Button>
          }
        >
          {d.hojeStatus === 'loading' ? (
            <Skeleton variant="rounded" height={240} />
          ) : !d.solarHoje || d.solarHoje.curva.length === 0 ? (
            <EmptyState
              message={
                d.hojeStatus === 'erro'
                  ? 'Não foi possível carregar a geração de hoje.'
                  : 'Nenhuma leitura de potência hoje ainda.'
              }
            />
          ) : (
            <Box sx={{ height: { xs: 200, md: 240 } }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={d.solarHoje.curva} margin={{ top: 12, right: 8, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashSolar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={colors.chart.primary} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={colors.chart.primary} stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="horario" {...axisProps} minTickGap={celular ? 40 : 28} />
                  <YAxis {...yAxisProps} width={56} tickFormatter={(v: number) => kw(v)} />
                  <RTooltip {...tooltipProps} formatter={(v) => [kw(Number(v)), 'Potência']} />
                  <Area
                    type="monotone"
                    dataKey="potencia"
                    stroke={colors.chart.primary}
                    strokeWidth={2.5}
                    fill="url(#dashSolar)"
                  />
                  {d.solarHoje.pico && (
                    <ReferenceDot
                      x={d.solarHoje.pico.horario}
                      y={d.solarHoje.pico.potencia}
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

      <Box sx={grade({ lg: 'repeat(2, minmax(0, 1fr))' })}>
        <SectionCard
          title="Geração no ano"
          subtitle={
            d.solarAno?.melhorMes
              ? `kWh por mês · melhor mês: ${MONTHS_PT[d.solarAno.melhorMes.idx]} (${kwh(d.solarAno.melhorMes.valor, 0)})`
              : 'kWh por mês'
          }
          action={
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '0.75rem', color: 'text.secondary' }}
              >
                <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: palette.gray[300] }} />
                {hoje.ano - 1}
              </Box>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '0.75rem', color: 'text.secondary' }}
              >
                <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: colors.chart.primary }} />
                {hoje.ano}
              </Box>
              {ytd !== null && <TrendPill value={ytd} positiveIsGood />}
            </Box>
          }
        >
          {d.anoStatus === 'loading' ? (
            <Skeleton variant="rounded" height={230} />
          ) : !d.solarAno ? (
            <EmptyState message="Não foi possível carregar a geração do ano." />
          ) : (
            <>
              <Box sx={{ height: { xs: 200, md: 220 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosAno} margin={{ top: 8, right: 4, left: -8, bottom: 0 }} barGap={2}>
                    <CartesianGrid {...gridProps} />
                    <XAxis dataKey="mes" {...axisProps} interval={celular ? 1 : 0} fontSize={11} />
                    <YAxis {...yAxisProps} width={40} />
                    <RTooltip
                      {...tooltipProps}
                      formatter={(v, n) => [kwh(Number(v), 0), n === 'atual' ? String(hoje.ano) : String(hoje.ano - 1)]}
                    />
                    <Bar dataKey="anterior" fill={palette.gray[300]} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="atual" fill={colors.chart.primary} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              {d.solarMes?.previsao ? (
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5 }}>
                  Previsão de {MONTHS_PT[hoje.mes - 1]}: <b>~{kwh(Math.round(d.solarMes.previsao), 0)}</b>
                </Typography>
              ) : null}
            </>
          )}
        </SectionCard>

        <SectionCard
          title="Valor do carro (FIPE)"
          subtitle={d.fipe?.descricao ? `${d.fipe.descricao} · últimos 12 meses` : 'Últimos 12 meses'}
          action={
            d.fipe?.variacao12m != null ? (
              <TrendPill value={d.fipe.variacao12m} positiveIsGood suffix="em 12m" />
            ) : undefined
          }
        >
          {d.fipeStatus === 'loading' ? (
            <Skeleton variant="rounded" height={230} />
          ) : !d.fipe || d.fipe.pontos.length < 2 ? (
            <EmptyState
              message={
                d.fipeStatus === 'erro' ? 'Não foi possível carregar o histórico FIPE.' : 'Histórico FIPE insuficiente.'
              }
            />
          ) : (
            <>
              <Box sx={{ height: { xs: 180, md: 200 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={d.fipe.pontos} margin={{ top: 10, right: 12, left: -4, bottom: 0 }}>
                    <CartesianGrid {...gridProps} />
                    <XAxis dataKey="rotulo" {...axisProps} minTickGap={celular ? 30 : 16} />
                    <YAxis
                      {...yAxisProps}
                      width={48}
                      domain={['auto', 'auto']}
                      tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                    />
                    <RTooltip
                      {...tooltipProps}
                      formatter={(v) => [formatCurrency(Number(v)), 'FIPE']}
                      labelFormatter={(l) => `Referência ${l}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="valor"
                      stroke={palette.violet[600]}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
              {d.fipe.perdaMensalMedia !== null && d.fipe.projecao12m !== null && (
                <Box
                  sx={{
                    mt: 1.5,
                    bgcolor: 'grey.50',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 1.5,
                    fontSize: '0.8125rem',
                  }}
                >
                  {d.fipe.perdaMensalMedia > 0 ? (
                    <>
                      Depreciação média de <b>{formatCurrency(d.fipe.perdaMensalMedia, true)}/mês</b> · projeção em 12
                      meses: <b>{formatCurrency(d.fipe.projecao12m, true)}</b>
                    </>
                  ) : (
                    <>
                      O valor se manteve ou subiu no período — média de{' '}
                      <b>+{formatCurrency(-d.fipe.perdaMensalMedia, true)}/mês</b>.
                    </>
                  )}
                </Box>
              )}
            </>
          )}
        </SectionCard>
      </Box>

      <SectionCard title="Câmbio hoje" subtitle="Cotação atual entre a mínima e a máxima do dia">
        {d.cambioStatus === 'loading' ? (
          <Skeleton variant="rounded" height={90} />
        ) : d.cambioStatus === 'erro' ? (
          <EmptyState message="Não foi possível carregar as cotações." compact />
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              gap: { xs: 2.5, md: 5 },
            }}
          >
            {d.cambios.dolar && <LinhaCambio c={d.cambios.dolar} />}
            {d.cambios.euro && <LinhaCambio c={d.cambios.euro} />}
          </Box>
        )}
      </SectionCard>
    </Box>
  );
}
