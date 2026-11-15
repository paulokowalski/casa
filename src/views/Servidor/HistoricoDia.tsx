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
import type { ServidorDia, ServidorPonto } from '../../types/servidor';
import { bytes, graus, LIMITES, numero, pct, taxa } from './formatos';
import { ListaDiscos } from './Agora';

interface Serie {
  chave: keyof ServidorPonto;
  nome: string;
  cor: string;
  tracejada?: boolean;
}

interface GraficoProps {
  titulo: string;
  subtitulo?: string;
  pontos: ServidorPonto[];
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

const pctEixo = (v: number) => `${v}%`;
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
  const doisPorLinha = {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
    gap: { xs: 2, md: 2.5 },
  } as const;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 2.5 }, opacity: carregando ? 0.6 : 1 }}>
      <Box sx={doisPorLinha}>
        <Resumo dia={dia} />
        <SectionCard title="Discos" subtitle="Última medição do dia">
          <ListaDiscos discos={dia.discos} />
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
      <Grafico
        titulo="Carga do sistema"
        subtitulo="Load average de 1 minuto (acima do número de núcleos há fila de processos)"
        pontos={dia.serie}
        formatar={(v) => numero(v)}
        formatarEixo={(v) => numero(v, 1)}
        series={[{ chave: 'carga', nome: 'Carga', cor: s[4] }]}
      />
    </Box>
  );
}
