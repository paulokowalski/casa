import { useCallback, useState, type ReactNode } from 'react';
import { Alert, Box, Skeleton, Typography } from '@mui/material';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ModeFanOutlinedIcon from '@mui/icons-material/ToysOutlined';
import AirOutlinedIcon from '@mui/icons-material/AirOutlined';
import ThermostatOutlinedIcon from '@mui/icons-material/ThermostatOutlined';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import { KpiCard } from '../../components/ui/KpiCard';
import { SectionCard } from '../../components/ui/SectionCard';
import { StatusPill } from '../../components/ui/StatusPill';
import { EmptyState } from '../../components/ui/EmptyState';
import { axisProps, gridProps, tooltipProps, yAxisProps } from '../../components/charts/chartTheme';
import { colors } from '../../styles/colors';
import { tones, type Tone } from '../../styles/tokens';
import { servidorService } from '../../services/servidor';
import type {
  LimiteVentilacao,
  ServidorDisco,
  VentilacaoAgora,
  VentilacaoDia,
  VentilacaoResumoDia,
} from '../../types/servidor';
import { formatDateBR } from '../../utils/format';
import { diasAtras, graus, isoLocal, minutosLegivel, relativo } from './formatos';
import { Secao } from './Secao';
import { useAtualizarAoPedir, useRepetir } from './useRepetir';

/** O Home Assistant envia uma leitura por minuto. */
const ATUALIZAR_AGORA_MS = 60_000;
const ATUALIZAR_HISTORICO_MS = 5 * 60_000;
const DIAS_NO_GRAFICO = 30;

const grade4 = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
  gap: { xs: 2, md: 2.5 },
} as const;

const gradeAlvos = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' },
  gap: { xs: 1.5, md: 2 },
} as const;

const hora = (iso: string | null | undefined) => (iso ? iso.slice(11, 16) : '—');
const grausEixo = (v: number) => `${v}°`;
const horasEixo = (v: number) => `${v}h`;

// ---- quanto falta para ligar ----

interface Alvo {
  id: string;
  nome: string;
  detalhe?: string;
  temperatura: number | null;
  limite: LimiteVentilacao | null;
  repouso?: boolean;
}

/** Igual ao binary_sensor do HA: liga a partir de `liga`, desliga abaixo de `desliga`, no meio mantém. */
function situacao(a: Alvo): { rotulo: string; tom: Tone; falta: string } {
  const { liga, desliga } = a.limite ?? { liga: null, desliga: null };
  if (a.repouso) return { rotulo: 'em repouso', tom: 'neutral', falta: 'disco parado, frio' };
  if (a.temperatura === null || liga === null) return { rotulo: 'sem leitura', tom: 'neutral', falta: '—' };
  if (a.temperatura >= liga) return { rotulo: 'liga as ventoinhas', tom: 'error', falta: 'acima do limite' };
  const falta = `faltam ${graus(liga - a.temperatura)} para ligar`;
  if (desliga !== null && a.temperatura >= desliga) return { rotulo: 'faixa de espera', tom: 'warning', falta };
  return { rotulo: 'frio', tom: 'success', falta };
}

/** Barra de 25 °C até 10 °C acima do limite de ligar, com marcas no desliga e no liga. */
function Termometro({ a, tom }: Readonly<{ a: Alvo; tom: Tone }>) {
  const { liga, desliga } = a.limite ?? { liga: null, desliga: null };
  if (liga === null) return null;
  const min = 25;
  const max = liga + 10;
  const pos = (v: number) => `${Math.min(100, Math.max(0, ((v - min) / (max - min)) * 100))}%`;
  return (
    <Box sx={{ position: 'relative', height: 8, borderRadius: 4, bgcolor: 'action.hover', mt: 1.5, mb: 2.5 }}>
      {a.temperatura !== null && !a.repouso && (
        <Box
          sx={{ position: 'absolute', inset: 0, width: pos(a.temperatura), borderRadius: 4, bgcolor: tones[tom].solid }}
        />
      )}
      {[
        { v: desliga, rotulo: `${desliga}°` },
        { v: liga, rotulo: `${liga}°` },
      ].map(
        (m) =>
          m.v !== null && (
            <Box key={m.rotulo} sx={{ position: 'absolute', left: pos(m.v), top: -3, transform: 'translateX(-1px)' }}>
              <Box sx={{ width: 2, height: 14, bgcolor: 'text.secondary', borderRadius: 1 }} />
              <Typography
                component="span"
                sx={{
                  position: 'absolute',
                  top: 15,
                  left: 1,
                  transform: 'translateX(-50%)',
                  fontSize: '0.6875rem',
                  color: 'text.secondary',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {m.rotulo}
              </Typography>
            </Box>
          ),
      )}
    </Box>
  );
}

function CartaoAlvo({ a }: Readonly<{ a: Alvo }>) {
  const s = situacao(a);
  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 1.75, minWidth: 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" component="h3" noWrap>
            {a.nome}
          </Typography>
          {a.detalhe && (
            <Typography variant="caption" color="text.secondary" noWrap component="p">
              {a.detalhe}
            </Typography>
          )}
        </Box>
        <StatusPill size="sm" tone={s.tom}>
          {s.rotulo}
        </StatusPill>
      </Box>
      <Typography sx={{ mt: 1, fontSize: '1.5rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
        {a.repouso ? '—' : graus(a.temperatura)}
      </Typography>
      <Typography variant="body2" sx={{ color: s.tom === 'error' ? tones.error.fg : 'text.secondary' }}>
        {s.falta}
      </Typography>
      <Termometro a={a} tom={s.tom} />
      <Typography variant="caption" color="text.secondary" component="p">
        liga em {graus(a.limite?.liga)} · desliga abaixo de {graus(a.limite?.desliga)}
      </Typography>
    </Box>
  );
}

function alvosDe(v: VentilacaoAgora, discos: ServidorDisco[]): Alvo[] {
  const l = v.leitura;
  const hds = discos.filter((d) => d.tipo === 'hdd');
  const alvosHd: Alvo[] =
    hds.length > 0
      ? hds.map((d) => ({
          id: `hd-${d.nome}`,
          nome: d.nome,
          detalhe: d.modelo ?? 'HD',
          temperatura: d.temperatura,
          limite: l.limiteHds,
          repouso: d.estadoTemperatura === 'repouso',
        }))
      : [
          {
            id: 'hds',
            nome: 'HDs',
            detalhe: 'o mais quente',
            temperatura: l.hds && l.hds > 0 ? l.hds : null,
            limite: l.limiteHds,
            repouso: l.hds === 0,
          },
        ];
  return [
    ...alvosHd,
    { id: 'nvme', nome: 'NVMe', detalhe: 'SSD do Docker e dos apps', temperatura: l.nvme, limite: l.limiteNvme },
    { id: 'soc', nome: 'Processador (SoC)', detalhe: 'ponto mais quente', temperatura: l.soc, limite: l.limiteSoc },
  ];
}

/** O alvo que está mais perto de ligar as ventoinhas (ou o que já passou do limite). */
function maisPerto(alvos: Alvo[]): { alvo: Alvo; falta: number } | null {
  let melhor: { alvo: Alvo; falta: number } | null = null;
  for (const a of alvos) {
    if (a.repouso || a.temperatura === null || a.limite?.liga == null) continue;
    const falta = a.limite.liga - a.temperatura;
    if (!melhor || falta < melhor.falta) melhor = { alvo: a, falta };
  }
  return melhor;
}

function estadoTomada(t: string | undefined): { rotulo: string; tom: Tone } {
  if (t === 'on') return { rotulo: 'Ligadas', tom: 'info' };
  if (t === 'off') return { rotulo: 'Desligadas', tom: 'neutral' };
  if (t === 'unavailable') return { rotulo: 'Tomada fora do ar', tom: 'error' };
  return { rotulo: 'Desconhecido', tom: 'warning' };
}

function Agora({
  v,
  carregando,
  discos,
}: Readonly<{ v: VentilacaoAgora | null; carregando: boolean; discos: ServidorDisco[] }>) {
  const semDados = !v && carregando;
  if (!v && !carregando) return <EmptyState message="Sem leitura da ventilação ainda." />;
  const alvos = v ? alvosDe(v, discos) : [];
  const perto = maisPerto(alvos);
  const tomada = estadoTomada(v?.leitura.tomada);
  const pctHoje =
    v && v.minutosComDadosHoje > 0 ? Math.round((v.minutosLigadaHoje / v.minutosComDadosHoje) * 100) : null;
  return (
    <>
      <Box sx={grade4}>
        <KpiCard
          label="Ventoinhas"
          icon={<ModeFanOutlinedIcon />}
          loading={semDados}
          tone={v?.desatualizado ? 'warning' : tomada.tom}
          value={tomada.rotulo}
          footer={
            v?.desatualizado
              ? `sem leitura do Home Assistant ${relativo(v.recebidoEm)}`
              : v?.desde
                ? `desde ${hora(v.desde)}${v.desde.slice(0, 10) === isoLocal(new Date()) ? '' : ` de ${formatDateBR(v.desde.slice(0, 10))}`} (${relativo(v.desde)})`
                : undefined
          }
        />
        <KpiCard
          label="Ligadas hoje"
          icon={<TimerOutlinedIcon />}
          loading={semDados}
          tone="brand"
          value={v ? minutosLegivel(v.minutosLigadaHoje) : '—'}
          footer={v ? `${pctHoje ?? 0}% de ${minutosLegivel(v.minutosComDadosHoje)} com leitura hoje` : undefined}
        />
        <KpiCard
          label="Mais perto de ligar"
          icon={<ThermostatOutlinedIcon />}
          loading={semDados}
          tone={!perto ? 'neutral' : perto.falta <= 0 ? 'error' : perto.falta <= 3 ? 'warning' : 'success'}
          value={!perto ? '—' : perto.falta <= 0 ? 'Acima do limite' : `Faltam ${graus(perto.falta)}`}
          footer={
            perto
              ? `${perto.alvo.nome}: ${graus(perto.alvo.temperatura)} (liga em ${graus(perto.alvo.limite?.liga)})`
              : undefined
          }
        />
        <KpiCard
          label="Controle"
          icon={<AirOutlinedIcon />}
          loading={semDados}
          tone={v?.leitura.automatica === false ? 'warning' : 'success'}
          value={v?.leitura.automatica === false ? 'Manual' : 'Automático'}
          footer={
            v?.leitura.precisa === null || v?.leitura.precisa === undefined
              ? undefined
              : v.leitura.precisa
                ? 'o HA quer as ventoinhas ligadas'
                : 'o HA quer as ventoinhas desligadas'
          }
        />
      </Box>
      <SectionCard
        title="Quanto falta para ligar"
        subtitle="Liga quando qualquer um chega no limite; só desliga quando todos ficam abaixo do limite de desligar. Na faixa de espera fica como está."
      >
        {semDados ? (
          <Skeleton variant="rounded" height={160} />
        ) : (
          <Box sx={gradeAlvos}>
            {alvos.map((a) => (
              <CartaoAlvo key={a.id} a={a} />
            ))}
          </Box>
        )}
      </SectionCard>
    </>
  );
}

// ---- histórico ----

function GraficoDia({ dia, carregando }: Readonly<{ dia: VentilacaoDia | null; carregando: boolean }>) {
  const r = dia?.resumo;
  const subtitulo = r
    ? `Ligadas ${minutosLegivel(r.minutosLigada)} · ligou ${r.vezesLigou} ${r.vezesLigou === 1 ? 'vez' : 'vezes'} · ${minutosLegivel(r.minutosComDados)} com leitura`
    : undefined;
  return (
    <SectionCard title="Ventoinhas e temperaturas" subtitle={subtitulo}>
      {carregando && !dia ? (
        <Skeleton variant="rounded" height={260} />
      ) : !dia || dia.pontos.length === 0 ? (
        <EmptyState message="Sem leituras neste dia (o histórico começou em 21/11/2026 à noite)." />
      ) : (
        <>
          <Box sx={{ height: { xs: 240, md: 300 } }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dia.pontos} margin={{ top: 8, right: 8, left: -4, bottom: 0 }}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="horario" {...axisProps} minTickGap={32} />
                <YAxis yAxisId="t" {...yAxisProps} width={44} domain={['auto', 'auto']} tickFormatter={grausEixo} />
                <YAxis yAxisId="f" hide domain={[0, 1]} />
                <Tooltip
                  {...tooltipProps}
                  cursor={{ stroke: colors.chart.muted }}
                  formatter={(v, nome) => {
                    if (nome === 'Ventoinhas') return [v === 1 ? 'ligadas' : v === 0 ? 'desligadas' : '—', nome];
                    return [v === null || v === undefined ? '—' : graus(Number(v)), nome];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  yAxisId="f"
                  type="stepAfter"
                  dataKey="ligada"
                  name="Ventoinhas"
                  stroke={colors.chart.primary}
                  strokeWidth={0}
                  fill={colors.chart.primarySoft}
                  fillOpacity={0.6}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="t"
                  type="monotone"
                  dataKey="hds"
                  name="HDs"
                  stroke={colors.chart.warning}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="t"
                  type="monotone"
                  dataKey="nvme"
                  name="NVMe"
                  stroke={colors.chart.violet}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="t"
                  type="monotone"
                  dataKey="soc"
                  name="SoC"
                  stroke={colors.chart.secondary}
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
          <Periodos periodos={dia.periodos} />
        </>
      )}
    </SectionCard>
  );
}

function Periodos({ periodos }: Readonly<{ periodos: VentilacaoDia['periodos'] }>) {
  if (periodos.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
        As ventoinhas não ligaram neste dia.
      </Typography>
    );
  }
  return (
    <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.75 }} aria-label="Períodos ligadas">
      {periodos.map((p) => (
        <StatusPill key={p.inicio} size="sm" tone="info">
          {hora(p.inicio)}–{hora(p.fim)} · {minutosLegivel(p.minutos)}
        </StatusPill>
      ))}
    </Box>
  );
}

function GraficoDias({
  dias,
  carregando,
  selecionado,
  onSelecionar,
}: Readonly<{
  dias: VentilacaoResumoDia[];
  carregando: boolean;
  selecionado: string;
  onSelecionar: (data: string) => void;
}>) {
  const porData = new Map(dias.map((d) => [d.data, d]));
  const pontos = Array.from({ length: DIAS_NO_GRAFICO }, (_v, i) => {
    const data = diasAtras(DIAS_NO_GRAFICO - 1 - i);
    const d = porData.get(data);
    return {
      data,
      rotulo: `${data.slice(8, 10)}/${data.slice(5, 7)}`,
      horas: d ? Math.round((d.minutosLigada / 60) * 10) / 10 : null,
      minutos: d?.minutosLigada ?? null,
      comDados: d?.minutosComDados ?? 0,
      vezes: d?.vezesLigou ?? 0,
    };
  });
  const temDados = dias.length > 0;
  return (
    <SectionCard
      title="Tempo ligadas por dia"
      subtitle={`Últimos ${DIAS_NO_GRAFICO} dias · toque em um dia para ver o gráfico dele`}
    >
      {carregando && !temDados ? (
        <Skeleton variant="rounded" height={240} />
      ) : !temDados ? (
        <EmptyState message="Ainda não há dias com leitura." />
      ) : (
        <Box sx={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pontos} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="rotulo" {...axisProps} minTickGap={8} />
              <YAxis {...yAxisProps} width={40} tickFormatter={horasEixo} allowDecimals={false} />
              <Tooltip
                {...tooltipProps}
                labelFormatter={(_r, p) => (p?.[0]?.payload ? formatDateBR(p[0].payload.data) : '')}
                formatter={(_v, _n, item) => {
                  const p = item.payload as (typeof pontos)[number];
                  if (p.minutos === null) return ['sem leitura', 'Ventoinhas'];
                  return [
                    `${minutosLegivel(p.minutos)} (ligou ${p.vezes}×, ${minutosLegivel(p.comDados)} com leitura)`,
                    'Ligadas',
                  ];
                }}
              />
              <Bar
                dataKey="horas"
                radius={[3, 3, 0, 0]}
                onClick={(d) => d?.payload?.data && onSelecionar(d.payload.data)}
                style={{ cursor: 'pointer' }}
              >
                {pontos.map((p) => (
                  <Cell key={p.data} fill={p.data === selecionado ? colors.chart.primary : colors.chart.primarySoft} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </SectionCard>
  );
}

// ---- aba ----

interface VentilacaoProps {
  data: string;
  seletorDia: ReactNode;
  tituloDia: string;
  onSelecionarDia: (data: string) => void;
  /** discos da leitura ao vivo (temperatura de cada HD) */
  discos: ServidorDisco[];
  /** Muda quando o botão "Atualizar agora" do cabeçalho é apertado. */
  pedidoAtualizar: number;
}

export function Ventilacao({
  data,
  seletorDia,
  tituloDia,
  onSelecionarDia,
  discos,
  pedidoAtualizar,
}: Readonly<VentilacaoProps>) {
  const [agora, setAgora] = useState<VentilacaoAgora | null>(null);
  const [carregandoAgora, setCarregandoAgora] = useState(true);
  const [erroAgora, setErroAgora] = useState<string | null>(null);
  const [dia, setDia] = useState<VentilacaoDia | null>(null);
  const [carregandoDia, setCarregandoDia] = useState(true);
  const [erroDia, setErroDia] = useState<string | null>(null);
  const [dias, setDias] = useState<VentilacaoResumoDia[]>([]);
  const [carregandoDias, setCarregandoDias] = useState(true);
  const [erroDias, setErroDias] = useState<string | null>(null);

  const lerAgora = useCallback(() => {
    servidorService
      .ventilacao()
      .then((v) => {
        setAgora(v);
        setErroAgora(null);
      })
      .catch((e: Error) => setErroAgora(e.message))
      .finally(() => setCarregandoAgora(false));
  }, []);

  const lerDia = useCallback(() => {
    setCarregandoDia(true);
    servidorService
      .ventilacaoDia(data)
      .then((d) => {
        setDia(d);
        setErroDia(null);
      })
      .catch((e: Error) => {
        setDia(null);
        setErroDia(e.message);
      })
      .finally(() => setCarregandoDia(false));
  }, [data]);

  const lerDias = useCallback(() => {
    setCarregandoDias(true);
    servidorService
      .ventilacaoDias(diasAtras(DIAS_NO_GRAFICO - 1), isoLocal(new Date()))
      .then((d) => {
        setDias(d);
        setErroDias(null);
      })
      .catch((e: Error) => setErroDias(e.message))
      .finally(() => setCarregandoDias(false));
  }, []);

  useRepetir(lerAgora, ATUALIZAR_AGORA_MS);
  useRepetir(lerDia, ATUALIZAR_AGORA_MS);
  useRepetir(lerDias, ATUALIZAR_HISTORICO_MS);
  useAtualizarAoPedir(pedidoAtualizar, lerAgora, lerDia, lerDias);

  const info = agora
    ? `Lido pelo Home Assistant às ${hora(agora.recebidoEm)} · atualiza a cada minuto`
    : 'Atualiza a cada minuto';

  return (
    <>
      <Secao id="ventilacao-agora" titulo="Agora" info={info} erro={erroAgora}>
        <Agora v={agora} carregando={carregandoAgora} discos={discos} />
      </Secao>
      <Secao id="ventilacao-dia" titulo={tituloDia} acao={seletorDia} erro={erroDia}>
        <GraficoDia dia={dia} carregando={carregandoDia} />
        {erroDias && <Alert severity="warning">Tempo ligadas por dia: {erroDias}</Alert>}
        <GraficoDias dias={dias} carregando={carregandoDias} selecionado={data} onSelecionar={onSelecionarDia} />
      </Secao>
    </>
  );
}
