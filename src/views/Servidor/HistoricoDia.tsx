import { Box, Skeleton, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { SectionCard } from '../../components/ui/SectionCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { axisProps, gridProps, tooltipProps, yAxisProps } from '../../components/charts/chartTheme';
import { colors } from '../../styles/colors';
import type { ContainerDia, SerieContainer, ServidorDia } from '../../types/servidor';
import { bytes, graus, LIMITES, ms, numero, pct, taxa } from './formatos';
import { ListaEventos } from './Host';
import { ListaDiscos } from './Agora';
import { ContainersDia } from './Containers';

const TOP_CONTAINERS = 6;

interface Serie {
  chave: string;
  nome: string;
  cor: string;
  tracejada?: boolean;
}

interface GraficoProps {
  titulo: string;
  subtitulo?: string;
  pontos: object[];
  series: Serie[];
  formatar: (v: number) => string;
  formatarEixo?: (v: number) => string;
  dominio?: [number | 'auto', number | 'auto'];
  limite?: number;
}

function Grafico({
  titulo,
  subtitulo,
  pontos,
  series,
  formatar,
  formatarEixo,
  dominio,
  limite,
}: Readonly<GraficoProps>) {
  return (
    <SectionCard title={titulo} subtitle={subtitulo}>
      <Box sx={{ height: { xs: 200, md: 240 } }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={pontos} margin={{ top: 8, right: 8, left: -4, bottom: 0 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="horario" {...axisProps} minTickGap={32} />
            <YAxis {...yAxisProps} width={56} domain={dominio} tickFormatter={formatarEixo ?? formatar} />
            <Tooltip
              {...tooltipProps}
              cursor={{ stroke: colors.chart.muted }}
              formatter={(v, nome) => [v === null || v === undefined ? '—' : formatar(Number(v)), nome]}
            />
            {series.length > 1 && <Legend iconType="plainline" wrapperStyle={{ fontSize: 12 }} />}
            {limite !== undefined && (
              <ReferenceLine y={limite} stroke={colors.chart.warning} strokeDasharray="4 4" ifOverflow="extendDomain" />
            )}
            {series.map((s) => (
              <Line
                key={s.chave}
                type="monotone"
                dataKey={s.chave}
                name={s.nome}
                stroke={s.cor}
                strokeWidth={s.tracejada ? 1.5 : 2}
                strokeDasharray={s.tracejada ? '4 3' : undefined}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </SectionCard>
  );
}

/**
 * Junta as séries dos containers escolhidos numa linha por horário ({horario, c0, c1, ...}). As chaves são
 * posições e não nomes, porque o Recharts trataria um ponto no nome do container como caminho.
 */
function porHorario(series: SerieContainer[], nomes: string[], campo: 'cpu' | 'memoria'): object[] {
  const linhas = new Map<string, Record<string, string | number | null>>();
  nomes.forEach((nome, i) => {
    series
      .find((s) => s.nome === nome)
      ?.pontos.forEach((p) => {
        const linha = linhas.get(p.horario) ?? { horario: p.horario };
        linha[`c${i}`] = p[campo];
        linhas.set(p.horario, linha);
      });
  });
  return [...linhas.values()].sort((a, b) => String(a.horario).localeCompare(String(b.horario)));
}

function maiores(containers: ContainerDia[], valor: (c: ContainerDia) => number | null): string[] {
  return containers
    .filter((c) => (valor(c) ?? 0) > 0)
    .sort((a, b) => (valor(b) ?? 0) - (valor(a) ?? 0))
    .slice(0, TOP_CONTAINERS)
    .map((c) => c.nome);
}

/** Uma linha por horário com a temperatura de cada disco ({horario, d0, d1, ...}). */
function temperaturasDosDiscos(dia: ServidorDia): object[] {
  const linhas = new Map<string, Record<string, string | number | null>>();
  dia.serieDiscos.forEach((disco, i) =>
    disco.pontos.forEach((p) => {
      const linha = linhas.get(p.horario) ?? { horario: p.horario };
      linha[`d${i}`] = p.temperatura;
      linhas.set(p.horario, linha);
    }),
  );
  return [...linhas.values()].sort((a, b) => String(a.horario).localeCompare(String(b.horario)));
}

const pctEixo = (v: number) => `${v}%`;
const msEixo = (v: number) => `${v}ms`;

/** Série do servidor com a NPU do host (mesmos blocos de 5 minutos). */
function comNpu(dia: ServidorDia): object[] {
  const npu = new Map(dia.serieHost.map((p) => [p.horario, p.npu]));
  return dia.serie.map((p) => ({ ...p, npu: npu.get(p.horario) ?? null }));
}

function ResumoHost({ dia }: Readonly<{ dia: ServidorDia }>) {
  const h = dia.resumoHost;
  const r = dia.resumo;
  return (
    <SectionCard title="Sistema no dia" subtitle="Internet, DNS, alertas, backup, pressão e discos">
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.5, fontSize: '0.8125rem' }}>
        {h ? (
          <>
            <Total
              rotulo="Internet fora"
              valor={h.minutosSemInternet === 0 ? 'nenhum minuto' : `${h.minutosSemInternet} min`}
            />
            <Total
              rotulo="Latência internet média · pico"
              valor={`${ms(h.internetLatencia.media)} · ${ms(h.internetLatencia.max)}`}
            />
            <Total
              rotulo="DNS falhando"
              valor={h.minutosDnsFalhando === 0 ? 'nenhum minuto' : `${h.minutosDnsFalhando} min`}
            />
            <Total
              rotulo="Tailscale offline"
              valor={h.minutosTailscaleOffline === 0 ? 'nenhum minuto' : `${h.minutosTailscaleOffline} min`}
            />
            <Total
              rotulo="Minutos com alerta"
              valor={`${h.minutosComAlerta} min (máx. ${h.alertasMax} ao mesmo tempo)`}
            />
            <Total
              rotulo="Disco desmontado"
              valor={h.minutosDiscoDesmontado === 0 ? 'nenhum minuto' : `${h.minutosDiscoDesmontado} min`}
            />
            <Total
              rotulo="Backup mais atrasado"
              valor={h.backupIdadeMaxHoras === null ? '—' : `${h.backupIdadeMaxHoras.toLocaleString('pt-BR')} h`}
            />
            <Total rotulo="Containers reiniciados" valor={String(h.containersReinicios ?? 0)} />
            <Total rotulo="Eventos (erros)" valor={`${h.eventos} (${h.eventosErro})`} />
            <Total rotulo="NPU média · pico" valor={`${pct(h.npu.media)} · ${pct(h.npu.max)}`} />
          </>
        ) : (
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Typography variant="caption">Sem amostras do host neste dia (coleta começou em 15/11/2026).</Typography>
          </Box>
        )}
        <Total
          rotulo="Pressão CPU · mem · I/O (pico)"
          valor={`${pct(r.pressaoCpu?.max)} · ${pct(r.pressaoMemoria?.max)} · ${pct(r.pressaoIo?.max)}`}
        />
        <Total rotulo="GPU média · pico" valor={`${pct(r.gpu?.media)} · ${pct(r.gpu?.max)}`} />
        <Total
          rotulo="CPU limitada por calor"
          valor={
            r.minutosCpuLimitada === null
              ? '—'
              : r.minutosCpuLimitada === 0
                ? 'nunca'
                : `${r.minutosCpuLimitada} min (até ${pct(r.cpuLimiteMin, 0)})`
          }
        />
        <Total
          rotulo="Latência disco média · pico"
          valor={`${ms(r.discoLatencia?.media)} · ${ms(r.discoLatencia?.max)}`}
        />
        <Total rotulo="Disco mais ocupado (pico)" valor={pct(r.discoOcupacaoMax)} />
        <Total rotulo="Erros de rede" valor={r.redeErros === null ? '—' : r.redeErros.toLocaleString('pt-BR')} />
      </Box>
    </SectionCard>
  );
}
const grausEixo = (v: number) => `${v}°`;
const taxaEixo = (v: number) => bytes(v, 0).replace(' ', '');

function Resumo({ dia }: Readonly<{ dia: ServidorDia }>) {
  const r = dia.resumo;
  const linhas = [
    { nome: 'CPU', f: r.cpu, fmt: (v: number | null) => pct(v) },
    { nome: 'Memória', f: r.memoria, fmt: (v: number | null) => pct(v) },
    { nome: 'Temperatura', f: r.temperatura, fmt: graus },
    { nome: 'Carga (1 min)', f: r.carga, fmt: (v: number | null) => numero(v) },
  ];
  return (
    <SectionCard
      title="Resumo do dia"
      subtitle={`${r.amostras.toLocaleString('pt-BR')} amostras de 1 minuto`}
      padding="flush"
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ pl: 3 }}>Métrica</TableCell>
            <TableCell align="right">Mínimo</TableCell>
            <TableCell align="right">Média</TableCell>
            <TableCell align="right" sx={{ pr: 3 }}>
              Máximo
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {linhas.map((l) => (
            <TableRow key={l.nome}>
              <TableCell sx={{ pl: 3 }}>{l.nome}</TableCell>
              <TableCell align="right">{l.fmt(l.f.min)}</TableCell>
              <TableCell align="right">{l.fmt(l.f.media)}</TableCell>
              <TableCell align="right" sx={{ pr: 3, fontWeight: 600 }}>
                {l.fmt(l.f.max)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 1.5,
          px: 3,
          py: 2,
          borderTop: 1,
          borderColor: 'divider',
          fontSize: '0.8125rem',
        }}
      >
        <Total rotulo="Rede ↓ recebido" valor={bytes(r.redeRecebidaBytes)} />
        <Total rotulo="Rede ↑ enviado" valor={bytes(r.redeEnviadaBytes)} />
        <Total rotulo="Disco lido" valor={bytes(r.discoLidoBytes)} />
        <Total rotulo="Disco escrito" valor={bytes(r.discoEscritoBytes)} />
        <Total rotulo="Swap máximo" valor={pct(r.swapMax)} />
        <Total rotulo="iowait médio" valor={pct(r.iowaitMedia)} />
        <Total rotulo="Discos (pico)" valor={graus(r.discoTemperaturaMax)} />
      </Box>
    </SectionCard>
  );
}

function Total({ rotulo, valor }: Readonly<{ rotulo: string; valor: string }>) {
  return (
    <Box>
      <Typography variant="caption" component="p">
        {rotulo}
      </Typography>
      <Box sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{valor}</Box>
    </Box>
  );
}

export function HistoricoDia({ dia, carregando }: Readonly<{ dia: ServidorDia | null; carregando: boolean }>) {
  if (carregando && !dia) return <Skeleton variant="rounded" height={320} />;
  if (!dia || dia.resumo.amostras === 0) {
    return (
      <SectionCard title="Histórico do dia">
        <EmptyState message="Nenhuma amostra gravada neste dia. A coleta acontece a cada minuto." />
      </SectionCard>
    );
  }

  const s = colors.chart.series;
  const topCpu = maiores(dia.containers, (c) => c.cpuMedia);
  const topMem = maiores(dia.containers, (c) => c.memMedia);
  const doisPorLinha = {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
    gap: { xs: 2, md: 2.5 },
  } as const;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 2.5 }, opacity: carregando ? 0.6 : 1 }}>
      <Box sx={doisPorLinha}>
        <Resumo dia={dia} />
        <SectionCard title="Discos" subtitle="Espaço na última medição do dia e temperatura máxima">
          <ListaDiscos discos={dia.discos} doDia />
        </SectionCard>
      </Box>

      <Box sx={doisPorLinha}>
        <ResumoHost dia={dia} />
        <SectionCard
          title="Eventos do dia"
          subtitle="Backups, alertas, quedas, discos, containers, logins, kernel e boots"
        >
          <ListaEventos eventos={dia.eventos} vazio="Nenhum evento neste dia." />
        </SectionCard>
      </Box>

      <Box sx={doisPorLinha}>
        <Grafico
          titulo="CPU e memória"
          subtitulo="Média a cada 5 minutos"
          pontos={dia.serie}
          dominio={[0, 100]}
          limite={LIMITES.uso.aviso}
          formatar={(v) => pct(v)}
          formatarEixo={pctEixo}
          series={[
            { chave: 'cpu', nome: 'CPU', cor: s[0] },
            { chave: 'cpuMax', nome: 'CPU (pico)', cor: s[1], tracejada: true },
            { chave: 'memoria', nome: 'Memória', cor: s[4] },
            { chave: 'swap', nome: 'Swap', cor: s[6], tracejada: true },
          ]}
        />
        <Grafico
          titulo="Temperatura"
          subtitulo="Maior sensor a cada 5 minutos"
          pontos={dia.serie}
          dominio={['auto', 'auto']}
          limite={LIMITES.temperatura.aviso}
          formatar={graus}
          formatarEixo={grausEixo}
          series={[
            { chave: 'temperatura', nome: 'Média', cor: s[3] },
            { chave: 'temperaturaMax', nome: 'Pico', cor: s[5], tracejada: true },
          ]}
        />
        <Grafico
          titulo="Rede"
          subtitulo="Interfaces físicas"
          pontos={dia.serie}
          formatar={taxa}
          formatarEixo={taxaEixo}
          series={[
            { chave: 'redeRecebidaBps', nome: '↓ Recebido', cor: s[2] },
            { chave: 'redeEnviadaBps', nome: '↑ Enviado', cor: s[0] },
          ]}
        />
        <Grafico
          titulo="Disco"
          subtitulo="Leitura e escrita somando os discos"
          pontos={dia.serie}
          formatar={taxa}
          formatarEixo={taxaEixo}
          series={[
            { chave: 'discoLeituraBps', nome: 'Leitura', cor: s[9] },
            { chave: 'discoEscritaBps', nome: 'Escrita', cor: s[7] },
          ]}
        />
      </Box>
      <Box sx={doisPorLinha}>
        <Grafico
          titulo="Pressão (espera por recurso)"
          subtitulo="PSI: % do tempo com tarefa esperando · acima de 10% há disputa"
          pontos={dia.serie}
          limite={10}
          formatar={(v) => pct(v)}
          formatarEixo={pctEixo}
          series={[
            { chave: 'pressaoCpu', nome: 'CPU', cor: s[0] },
            { chave: 'pressaoMemoria', nome: 'Memória', cor: s[4] },
            { chave: 'pressaoIo', nome: 'Disco (I/O)', cor: s[7] },
          ]}
        />
        <Grafico
          titulo="Latência e ocupação dos discos"
          subtitulo="Tempo médio por operação · disco mais ocupado em %"
          pontos={dia.serie}
          limite={30}
          formatar={(v) => ms(v)}
          formatarEixo={msEixo}
          series={[
            { chave: 'discoLatenciaMs', nome: 'Latência média', cor: s[9] },
            { chave: 'discoLatenciaMaxMs', nome: 'Pior minuto', cor: s[5], tracejada: true },
          ]}
        />
        <Grafico
          titulo="GPU, NPU e limite da CPU"
          subtitulo="Uso da GPU e NPU · limite de frequência da CPU (abaixo de 100% = calor)"
          pontos={comNpu(dia)}
          dominio={[0, 100]}
          formatar={(v) => pct(v)}
          formatarEixo={pctEixo}
          series={[
            { chave: 'gpu', nome: 'GPU', cor: s[2] },
            { chave: 'npu', nome: 'NPU', cor: s[6] },
            { chave: 'cpuLimite', nome: 'Limite CPU', cor: s[3], tracejada: true },
          ]}
        />
        <Grafico
          titulo="Internet"
          subtitulo="Ping a 1.1.1.1, roteador e DNS (Pi-hole) a cada 5 minutos"
          pontos={dia.serieHost}
          formatar={(v) => ms(v)}
          formatarEixo={msEixo}
          series={[
            { chave: 'internetMs', nome: 'Internet', cor: s[0] },
            { chave: 'internetMaxMs', nome: 'Internet (pico)', cor: s[1], tracejada: true },
            { chave: 'gatewayMs', nome: 'Roteador', cor: s[2] },
            { chave: 'dnsMs', nome: 'DNS', cor: s[4] },
          ]}
        />
      </Box>

      <Grafico
        titulo="Carga do sistema"
        subtitulo="Load average de 1 minuto (acima do número de núcleos há fila de processos)"
        pontos={dia.serie}
        formatar={(v) => numero(v)}
        formatarEixo={(v) => numero(v, 1)}
        series={[{ chave: 'carga', nome: 'Carga', cor: s[4] }]}
      />

      {dia.serieDiscos.length > 0 && (
        <Grafico
          titulo="Temperatura dos discos"
          subtitulo={`SMART a cada 5 minutos · HDs: ideal abaixo de ${LIMITES.hd.aviso} °C`}
          pontos={temperaturasDosDiscos(dia)}
          dominio={['auto', 'auto']}
          limite={LIMITES.hd.aviso}
          formatar={graus}
          formatarEixo={grausEixo}
          series={dia.serieDiscos.map((d, i) => ({ chave: `d${i}`, nome: d.nome, cor: s[i % s.length] }))}
        />
      )}

      {dia.containers.length > 0 && (
        <>
          <Box sx={doisPorLinha}>
            {topCpu.length > 0 && (
              <Grafico
                titulo="CPU por container"
                subtitulo={`Os ${topCpu.length} que mais usaram · % do servidor inteiro`}
                pontos={porHorario(dia.serieContainers, topCpu, 'cpu')}
                formatar={(v) => pct(v)}
                formatarEixo={pctEixo}
                series={topCpu.map((nome, i) => ({ chave: `c${i}`, nome, cor: s[i % s.length] }))}
              />
            )}
            {topMem.length > 0 && (
              <Grafico
                titulo="Memória por container"
                subtitulo={`Os ${topMem.length} que mais usaram`}
                pontos={porHorario(dia.serieContainers, topMem, 'memoria')}
                formatar={(v) => bytes(v)}
                formatarEixo={(v) => bytes(v, 0).replace(' ', '')}
                series={topMem.map((nome, i) => ({ chave: `c${i}`, nome, cor: s[i % s.length] }))}
              />
            )}
          </Box>
          <ContainersDia containers={dia.containers} />
        </>
      )}
    </Box>
  );
}
