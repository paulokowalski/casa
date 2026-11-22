import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  Link,
  ListItemIcon,
  Menu,
  MenuItem,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import FunctionsOutlinedIcon from '@mui/icons-material/FunctionsOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutlineOutlined';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader } from '../../components/ui/PageHeader';
import { SectionCard } from '../../components/ui/SectionCard';
import { KpiCard } from '../../components/ui/KpiCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusPill } from '../../components/ui/StatusPill';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { axisProps, gridProps, tooltipProps, yAxisProps } from '../../components/charts/chartTheme';
import { colors } from '../../styles/colors';
import { passagensService } from '../../services/passagens';
import type { Passagens, RotaPassagem, SeriePreco } from '../../types/passagens';
import { formatCurrency, formatDateBR } from '../../utils/format';
import { FormRota } from './FormRota';

/** O robô grava depois de cada busca (a cada hora); não adianta ler com mais frequência que isso. */
const ATUALIZAR_MS = 5 * 60_000;
const DIAS_SEMANA = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];

/** Dias de histórico no gráfico; '0' = tudo. Acima de 31 dias a API manda o menor preço de cada dia. */
type Periodo = '7' | '30' | '90' | '0';

const brl = (v: number) => formatCurrency(v, true);
const dataCurta = (iso: string) => formatDateBR(iso).slice(0, 5);
const dataHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const lista = (v: string[]) => v.join(', ');

const chaveSerie = (s: SeriePreco) => `${s.origem}-${s.destino} ${s.ida}${s.volta ? `→${s.volta}` : ''}`;
const rotuloSerie = (s: SeriePreco) =>
  `${s.origem}→${s.destino} ${dataCurta(s.ida)}${s.volta ? `–${dataCurta(s.volta)}` : ' só ida'}`;
const escalas = (n: number | null) => (n === null ? '—' : n === 0 ? 'direto' : `${n} escala${n > 1 ? 's' : ''}`);

function descreverDatas(r: RotaPassagem): string {
  if (r.datas.length > 0) {
    return r.datas
      .map((d) =>
        d.volta ? `ida ${formatDateBR(d.ida)}, volta ${formatDateBR(d.volta)}` : `${formatDateBR(d.ida)} (só ida)`,
      )
      .join(' · ');
  }
  const j = r.janela;
  if (!j) return '—';
  let t = `de ${formatDateBR(j.inicio)} a ${formatDateBR(j.fim)}`;
  if (j.passoDias && j.passoDias > 1) t += `, ida a cada ${j.passoDias} dias`;
  if (j.diasSemana?.length) t += `, só ${j.diasSemana.map((d) => DIAS_SEMANA[d]).join('/')}`;
  t += j.duracao ? `, viagem de ${j.duracao[0]} a ${j.duracao[1]} dias` : ' (só ida)';
  return t;
}

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

function descreverPassageiros(r: RotaPassagem): string {
  const partes = [plural(r.adultos, 'adulto', 'adultos')];
  if (r.criancas) partes.push(plural(r.criancas, 'criança', 'crianças'));
  if (r.bebesColo) partes.push(plural(r.bebesColo, 'bebê no colo', 'bebês no colo'));
  if (r.bebesAssento) partes.push(plural(r.bebesAssento, 'bebê c/ assento', 'bebês c/ assento'));
  return partes.join(', ');
}

function regraAlerta(r: RotaPassagem): string {
  const partes = [];
  if (r.precoAlvo) partes.push(`abaixo de ${brl(r.precoAlvo)}`);
  partes.push(`${r.quedaPct}% abaixo da média de 30 dias`);
  return `Alerta ${partes.join(' ou ')}`;
}

function Configuracao({ rota }: Readonly<{ rota: RotaPassagem }>) {
  const itens: [string, string][] = [
    ['Origem', lista(rota.origem)],
    ['Destino', lista(rota.destino)],
    ['Datas', descreverDatas(rota)],
    ['Tipo', rota.somenteIda ? 'Só ida' : 'Ida e volta'],
    ['Escalas', rota.maxEscalas === null ? 'qualquer' : rota.maxEscalas === 0 ? 'só direto' : `até ${rota.maxEscalas}`],
    ['Passageiros', descreverPassageiros(rota)],
    ['Preço-alvo', rota.precoAlvo ? brl(rota.precoAlvo) : '—'],
    ['Queda p/ alerta', `${rota.quedaPct}% abaixo da média`],
  ];
  return (
    <Box
      component="dl"
      sx={{
        m: 0,
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
        gap: 1.5,
      }}
    >
      {itens.map(([rotulo, valor]) => (
        <Box key={rotulo} sx={{ minWidth: 0 }}>
          <Typography component="dt" variant="caption" sx={{ color: 'text.secondary' }}>
            {rotulo}
          </Typography>
          <Typography component="dd" variant="body2" sx={{ m: 0, fontWeight: 500, overflowWrap: 'anywhere' }}>
            {valor}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function Grafico({ series, alvo, porDia }: Readonly<{ series: SeriePreco[]; alvo: number | null; porDia: boolean }>) {
  const { dados, chaves } = useMemo(() => {
    const porMomento = new Map<number, Record<string, number>>();
    for (const s of series) {
      const k = chaveSerie(s);
      for (const p of s.pontos) {
        const t = new Date(p.em).getTime();
        // buscas da mesma rodada caem em segundos diferentes: agrupa por minuto
        const minuto = Math.floor(t / 60_000) * 60_000;
        const linha = porMomento.get(minuto) ?? { t: minuto };
        linha[k] = p.preco;
        porMomento.set(minuto, linha);
      }
    }
    return {
      dados: [...porMomento.values()].sort((a, b) => a.t - b.t),
      chaves: series.map((s) => ({ k: chaveSerie(s), rotulo: rotuloSerie(s) })),
    };
  }, [series]);

  if (dados.length === 0) return <EmptyState message="Nenhuma busca neste período." compact />;

  return (
    <Box sx={{ height: { xs: 240, md: 300 } }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dados} margin={{ top: 12, right: 12, left: 4, bottom: 0 }}>
          <CartesianGrid {...gridProps} />
          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            {...axisProps}
            minTickGap={36}
            tickFormatter={(t: number) => new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
          />
          <YAxis {...yAxisProps} width={64} domain={['auto', 'auto']} tickFormatter={(v: number) => brl(v)} />
          <ChartTooltip
            {...tooltipProps}
            cursor={{ stroke: colors.chart.axis }}
            labelFormatter={(t) =>
              porDia
                ? `Menor preço de ${new Date(Number(t)).toLocaleDateString('pt-BR')}`
                : new Date(Number(t)).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
            }
            formatter={(v, nome) => [brl(Number(v)), chaves.find((c) => c.k === nome)?.rotulo ?? String(nome)]}
          />
          <Legend
            formatter={(nome: string) => chaves.find((c) => c.k === nome)?.rotulo ?? nome}
            wrapperStyle={{ fontSize: 12 }}
          />
          {alvo && (
            <ReferenceLine
              y={alvo}
              stroke={colors.chart.success}
              strokeDasharray="6 4"
              label={{
                value: `alvo ${brl(alvo)}`,
                position: 'insideTopRight',
                fill: colors.chart.success,
                fontSize: 12,
              }}
            />
          )}
          {chaves.map((c, i) => (
            <Line
              key={c.k}
              dataKey={c.k}
              type="stepAfter"
              stroke={colors.chart.series[i % colors.chart.series.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}

function TabelaSeries({ series }: Readonly<{ series: SeriePreco[] }>) {
  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table size="small" aria-label="Preços por trecho">
        <TableHead>
          <TableRow>
            <TableCell>Trecho</TableCell>
            <TableCell>Datas</TableCell>
            <TableCell align="right">Agora</TableCell>
            <TableCell align="right">Menor</TableCell>
            <TableCell align="right">Média</TableCell>
            <TableCell align="right">Maior</TableCell>
            <TableCell>Companhia</TableCell>
            <TableCell align="right">Buscas</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {[...series]
            .sort((a, b) => a.ultimo.preco - b.ultimo.preco)
            .map((s) => (
              <TableRow key={chaveSerie(s)}>
                <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>
                  {s.origem} → {s.destino}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {formatDateBR(s.ida)}
                  {s.volta ? ` – ${formatDateBR(s.volta)}` : ' (só ida)'}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {brl(s.ultimo.preco)}
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title={`em ${dataHora(s.minimo.em)} (${s.minimo.cias})`}>
                    <span>{brl(s.minimo.preco)}</span>
                  </Tooltip>
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  {brl(s.media)}
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  {brl(s.maximo)}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {s.ultimo.cias} · {escalas(s.ultimo.escalas)}
                </TableCell>
                <TableCell align="right">{s.buscas}</TableCell>
                <TableCell>
                  <Link href={s.url} target="_blank" rel="noopener noreferrer" underline="hover">
                    ver
                  </Link>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

interface AcoesRota {
  onEditar: (r: RotaPassagem) => void;
  onPausar: (r: RotaPassagem) => void;
  onRemover: (r: RotaPassagem) => void;
}

/** Menu ⋮ de uma rota: editar, pausar/retomar e remover. */
function MenuRota({ rota, onEditar, onPausar, onRemover }: Readonly<{ rota: RotaPassagem } & AcoesRota>) {
  const [ancora, setAncora] = useState<HTMLElement | null>(null);
  const fechar = () => setAncora(null);
  const fazer = (f: (r: RotaPassagem) => void) => () => {
    fechar();
    f(rota);
  };
  return (
    <>
      <IconButton aria-label={`Ações da rota ${rota.nome}`} onClick={(e) => setAncora(e.currentTarget)} size="small">
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={ancora} open={Boolean(ancora)} onClose={fechar}>
        <MenuItem onClick={fazer(onEditar)}>
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Editar
        </MenuItem>
        <MenuItem onClick={fazer(onPausar)}>
          <ListItemIcon>
            {rota.ativa ? <PauseCircleOutlineIcon fontSize="small" /> : <PlayCircleOutlineIcon fontSize="small" />}
          </ListItemIcon>
          {rota.ativa ? 'Pausar monitoramento' : 'Retomar monitoramento'}
        </MenuItem>
        <MenuItem onClick={fazer(onRemover)} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'inherit' }}>
            <DeleteOutlineIcon fontSize="small" />
          </ListItemIcon>
          Remover
        </MenuItem>
      </Menu>
    </>
  );
}

function CartaoRota({
  rota,
  series,
  porDia,
  ...acoes
}: Readonly<{ rota: RotaPassagem; series: SeriePreco[]; porDia: boolean } & AcoesRota>) {
  const agora = series.length ? series.reduce((a, b) => (b.ultimo.preco < a.ultimo.preco ? b : a)) : null;
  const menor = series.length ? series.reduce((a, b) => (b.minimo.preco < a.minimo.preco ? b : a)) : null;
  const total = series.reduce((n, s) => n + s.buscas, 0);
  const media = total ? Math.round(series.reduce((n, s) => n + s.media * s.buscas, 0) / total) : null;
  const falta = agora && rota.precoAlvo ? agora.ultimo.preco - rota.precoAlvo : null;

  return (
    <SectionCard
      title={rota.nome}
      subtitle={`${lista(rota.origem)} → ${lista(rota.destino)} · ${descreverDatas(rota)} · ${regraAlerta(rota)}`}
      action={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <StatusPill tone={rota.ativa ? 'success' : 'neutral'}>{rota.ativa ? 'Monitorando' : 'Pausada'}</StatusPill>
          <MenuRota rota={rota} {...acoes} />
        </Box>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Configuracao rota={rota} />
        {series.length === 0 ? (
          <EmptyState message="Ainda sem buscas para esta rota." compact />
        ) : (
          <>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
                gap: { xs: 1.5, md: 2 },
              }}
            >
              <KpiCard
                label="Melhor preço agora"
                tone="brand"
                icon={<SellOutlinedIcon />}
                value={agora ? brl(agora.ultimo.preco) : '—'}
                footer={agora ? `${agora.origem}→${agora.destino} · ${agora.ultimo.cias}` : undefined}
              />
              <KpiCard
                label="Menor já visto"
                tone="success"
                icon={<TrendingDownOutlinedIcon />}
                value={menor ? brl(menor.minimo.preco) : '—'}
                footer={menor ? `${menor.origem}→${menor.destino} em ${dataHora(menor.minimo.em)}` : undefined}
              />
              <KpiCard
                label="Média das buscas"
                tone="info"
                icon={<FunctionsOutlinedIcon />}
                value={media ? brl(media) : '—'}
                footer={`${total} busca${total === 1 ? '' : 's'}`}
              />
              <KpiCard
                label="Distância do alvo"
                tone={falta !== null && falta <= 0 ? 'success' : 'warning'}
                icon={<FlagOutlinedIcon />}
                value={falta === null ? '—' : falta <= 0 ? 'No alvo!' : `+${brl(falta)}`}
                footer={rota.precoAlvo ? `alvo ${brl(rota.precoAlvo)}` : 'sem preço-alvo'}
              />
            </Box>
            <Grafico series={series} alvo={rota.precoAlvo} porDia={porDia} />
            <TabelaSeries series={series} />
          </>
        )}
      </Box>
    </SectionCard>
  );
}

export function PassagensView() {
  const [dados, setDados] = useState<Passagens | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState<Periodo>('30');
  // só a resposta da última leitura vale: uma mais antiga (outro período) que chegue depois é descartada
  const seq = useRef(0);

  const ler = useCallback(() => {
    const minha = ++seq.current;
    passagensService
      .listar(Number(periodo))
      .then((d) => {
        if (minha !== seq.current) return;
        setDados(d);
        setErro(null);
      })
      .catch((e: Error) => {
        if (minha === seq.current) setErro(e.message);
      })
      .finally(() => {
        if (minha === seq.current) setCarregando(false);
      });
  }, [periodo]);

  useEffect(() => {
    ler();
    const timer = window.setInterval(() => {
      if (!document.hidden) ler();
    }, ATUALIZAR_MS);
    return () => window.clearInterval(timer);
  }, [ler]);

  const ativas = dados?.rotas.filter((r) => r.ativa) ?? [];
  const desligadas = dados?.rotas.filter((r) => !r.ativa) ?? [];
  const seriesDa = (r: RotaPassagem) => dados?.historico.filter((s) => s.rota === r.nome) ?? [];

  // ---- cadastro de rotas ----
  const [form, setForm] = useState<{ aberto: boolean; rota: RotaPassagem | null }>({ aberto: false, rota: null });
  const [remover, setRemover] = useState<RotaPassagem | null>(null);
  const [apagarHistorico, setApagarHistorico] = useState(false);
  const [removendo, setRemovendo] = useState(false);
  const [erroRemover, setErroRemover] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const salvo = (msg: string) => {
    setAviso(msg);
    ler();
  };

  const pausar = (r: RotaPassagem) => {
    passagensService
      .atualizarRota(r.id, {
        nome: r.nome,
        ativa: !r.ativa,
        origem: r.origem,
        destino: r.destino,
        datas: r.janela ? null : r.datas,
        janela: r.janela,
        precoAlvo: r.precoAlvo,
        maxEscalas: r.maxEscalas,
        quedaPct: r.quedaPct,
        adultos: r.adultos,
        criancas: r.criancas ?? 0,
        bebesAssento: r.bebesAssento ?? 0,
        bebesColo: r.bebesColo ?? 0,
      })
      .then(() => salvo(r.ativa ? `"${r.nome}" pausada.` : `"${r.nome}" voltou a ser monitorada.`))
      .catch((e: Error) => setErro(e.message));
  };

  const confirmarRemocao = () => {
    if (!remover) return;
    setRemovendo(true);
    setErroRemover(null);
    passagensService
      .removerRota(remover.id, apagarHistorico)
      .then(() => {
        salvo(`"${remover.nome}" removida${apagarHistorico ? ' com o histórico' : ''}.`);
        setRemover(null);
      })
      .catch((e: Error) => setErroRemover(e.message))
      .finally(() => setRemovendo(false));
  };

  const acoes: AcoesRota = {
    onEditar: (r) => setForm({ aberto: true, rota: r }),
    onPausar: pausar,
    onRemover: (r) => {
      setApagarHistorico(false);
      setErroRemover(null);
      setRemover(r);
    },
  };

  const subtitulo = dados
    ? `Última atualização ${dataHora(dados.geradoEm)} · busca a cada ${dados.intervaloHoras} h no Google Flights`
    : 'Histórico de preços do robô de passagens';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>
      <PageHeader
        section="Viagens"
        title="Passagens"
        subtitle={subtitulo}
        actions={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={periodo}
              onChange={(_, v: Periodo | null) => v && setPeriodo(v)}
              aria-label="Período do gráfico"
            >
              <ToggleButton value="7">7 dias</ToggleButton>
              <ToggleButton value="30">30 dias</ToggleButton>
              <ToggleButton value="90">90 dias</ToggleButton>
              <ToggleButton value="0">Tudo</ToggleButton>
            </ToggleButtonGroup>
            <Tooltip title="Atualizar agora">
              <IconButton onClick={ler} aria-label="Atualizar agora">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setForm({ aberto: true, rota: null })}>
              Nova rota
            </Button>
          </Box>
        }
      />

      {erro && <Alert severity="error">{erro}</Alert>}
      {aviso && (
        <Alert severity="success" onClose={() => setAviso(null)}>
          {aviso} O robô confere as rotas a cada 30 s e já busca o que for novo.
        </Alert>
      )}
      {dados?.desatualizado && (
        <Alert severity="warning">
          O robô de passagens não grava há mais de duas rodadas. Confira o container robo-passagens.
        </Alert>
      )}

      {carregando && !dados ? (
        <Skeleton variant="rounded" height={420} />
      ) : dados && ativas.length === 0 ? (
        <SectionCard>
          <EmptyState
            message="Nenhuma rota sendo monitorada."
            action={
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setForm({ aberto: true, rota: null })}>
                Nova rota
              </Button>
            }
          />
        </SectionCard>
      ) : (
        ativas.map((r) => (
          <CartaoRota key={r.id} rota={r} series={seriesDa(r)} porDia={dados?.agrupamento === 'dia'} {...acoes} />
        ))
      )}

      {dados && dados.alertas.length > 0 && (
        <SectionCard title="Alertas enviados" subtitle="Passagens baratas avisadas no Telegram">
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Quando</TableCell>
                  <TableCell>Rota</TableCell>
                  <TableCell>Trecho</TableCell>
                  <TableCell>Datas</TableCell>
                  <TableCell align="right">Preço</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dados.alertas.map((a) => (
                  <TableRow key={`${a.rota}|${a.origem}|${a.destino}|${a.ida}|${a.volta}`}>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{dataHora(a.em)}</TableCell>
                    <TableCell>{a.rota}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {a.origem} → {a.destino}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {formatDateBR(a.ida)}
                      {a.volta ? ` – ${formatDateBR(a.volta)}` : ' (só ida)'}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {brl(a.preco)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </SectionCard>
      )}

      {desligadas.length > 0 && (
        <SectionCard title="Rotas pausadas" subtitle="O robô não busca, mas o histórico fica guardado">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {desligadas.map((r) => (
              <Box key={r.id} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Box sx={{ flex: 1, minWidth: 0, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'baseline' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {r.nome}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {lista(r.origem)} → {lista(r.destino)} · {descreverDatas(r)}
                    {r.precoAlvo ? ` · alvo ${brl(r.precoAlvo)}` : ''}
                  </Typography>
                </Box>
                <MenuRota rota={r} {...acoes} />
              </Box>
            ))}
          </Box>
        </SectionCard>
      )}

      <FormRota
        open={form.aberto}
        rota={form.rota}
        onClose={() => setForm({ aberto: false, rota: null })}
        onSalvo={() => salvo(form.rota ? `"${form.rota.nome}" salva.` : 'Rota criada.')}
      />

      <ConfirmDialog
        open={remover !== null}
        title="Remover rota"
        description={
          <>
            O robô para de buscar <b>{remover?.nome}</b>. Para só parar por um tempo, use <i>Pausar</i>.
          </>
        }
        confirmLabel="Remover"
        destructive
        loading={removendo}
        error={erroRemover}
        onConfirm={confirmarRemocao}
        onClose={() => setRemover(null)}
      >
        <FormControlLabel
          sx={{ mt: 1.5 }}
          control={<Checkbox checked={apagarHistorico} onChange={(e) => setApagarHistorico(e.target.checked)} />}
          label="Apagar também o histórico de preços desta rota"
        />
      </ConfirmDialog>
    </Box>
  );
}
