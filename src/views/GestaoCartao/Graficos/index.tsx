import { Box, Skeleton, Typography } from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { SectionCard } from '../../../components/ui/SectionCard';
import { EmptyState } from '../../../components/ui/EmptyState';
import { CategoryBars } from '../../../components/charts/CategoryBars';
import { ShareBar } from '../../../components/charts/ShareBar';
import { axisProps, compactNumber, gridProps, tooltipProps, yAxisProps } from '../../../components/charts/chartTheme';
import { useGestaoCartao } from '../../../contexts/GestaoCartaoContext';
import { colors } from '../../../styles/colors';
import { palette, tones } from '../../../styles/tokens';
import { capitalize, formatCurrency, formatPercent } from '../../../utils/format';

function Legenda({ cor, texto, tracejado }: Readonly<{ cor: string; texto: string; tracejado?: boolean }>) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '0.75rem', color: 'text.secondary' }}>
      {tracejado ? (
        <Box sx={{ width: 14, borderTop: `2px dashed ${cor}` }} />
      ) : (
        <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: cor }} />
      )}
      {texto}
    </Box>
  );
}

const valorNoTopo =
  (indice: number | null, cor: string, prefixo = '') =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (p: any) =>
    (indice === null || p.index === indice) && p.value ? (
      <text x={p.x + p.width / 2} y={p.y - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill={cor}>
        {prefixo}
        {compactNumber(p.value)}
      </text>
    ) : null;

export function EvolucaoMensal() {
  const { analise, loading } = useGestaoCartao();
  return (
    <SectionCard
      title="Evolução mensal"
      subtitle="Últimos 12 meses"
      action={
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Legenda cor={colors.chart.primary} texto="Gasto" />
          {analise?.media6 ? <Legenda cor={palette.gray[400]} texto="Média 6m" tracejado /> : null}
          {analise?.orcamento ? <Legenda cor={tones.error.solid} texto="Orçamento" tracejado /> : null}
        </Box>
      }
    >
      {loading || !analise ? (
        <Skeleton variant="rounded" height={250} />
      ) : (
        <Box sx={{ height: { xs: 250, lg: 330 } }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analise.serie12} margin={{ top: 20, right: 4, left: -8, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="rotulo" {...axisProps} interval={0} fontSize={11} />
              <YAxis {...yAxisProps} width={44} tickFormatter={compactNumber} />
              <Tooltip {...tooltipProps} formatter={(v) => [formatCurrency(Number(v)), 'Gasto']} />
              {analise.orcamento && (
                <ReferenceLine
                  zIndex={250}
                  y={analise.orcamento.valor}
                  stroke={tones.error.solid}
                  strokeDasharray="6 4"
                  strokeWidth={1.5}
                />
              )}
              {analise.media6 && (
                <ReferenceLine
                  zIndex={250}
                  y={analise.media6}
                  stroke={palette.gray[400]}
                  strokeDasharray="6 4"
                  strokeWidth={1.5}
                />
              )}
              <Bar dataKey="valor" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {analise.serie12.map((s) => (
                  <Cell key={s.idx} fill={s.atual ? colors.chart.primary : colors.chart.primarySoft} />
                ))}
                <LabelList dataKey="valor" content={valorNoTopo(11, palette.brand[700])} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </SectionCard>
  );
}

export function PorCategoria({
  selecionada,
  onSelecionar,
}: Readonly<{ selecionada: string | null; onSelecionar: (c: string | null) => void }>) {
  const { analise, loading } = useGestaoCartao();
  return (
    <SectionCard title="Por categoria" subtitle="Variação vs média de 3 meses · clique para filtrar">
      {loading || !analise ? (
        <Skeleton variant="rounded" height={250} />
      ) : analise.categorias.length === 0 ? (
        <EmptyState message="Nenhum gasto no período." />
      ) : (
        <CategoryBars itens={analise.categorias} selecionada={selecionada} onSelecionar={onSelecionar} />
      )}
    </SectionCard>
  );
}

export function PorCartao() {
  const { analise, loading } = useGestaoCartao();
  return (
    <SectionCard title="Por cartão" subtitle="Concentração do gasto no mês" sx={{ height: '100%' }}>
      {loading || !analise ? (
        <Skeleton variant="rounded" height={140} />
      ) : analise.cartoes.length === 0 ? (
        <EmptyState message="Sem dados." compact />
      ) : (
        <ShareBar itens={analise.cartoes} />
      )}
    </SectionCard>
  );
}

export function PorDiaDaSemana() {
  const { analise, loading } = useGestaoCartao();
  const max = analise ? Math.max(0, ...analise.diasSemana.map((d) => d.valor)) : 0;
  return (
    <SectionCard title="Por dia da semana" subtitle="Compras à vista, pela data da compra" sx={{ height: '100%' }}>
      {loading || !analise ? (
        <Skeleton variant="rounded" height={150} />
      ) : max <= 0 ? (
        <EmptyState message="Sem compras à vista no período." compact />
      ) : (
        <Box sx={{ height: 150 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analise.diasSemana} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="dia" {...axisProps} />
              <Tooltip {...tooltipProps} formatter={(v) => [formatCurrency(Number(v)), 'Gasto']} />
              <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                {analise.diasSemana.map((d) => (
                  <Cell
                    key={d.dia}
                    fill={
                      d.valor >= max * 0.75
                        ? colors.chart.primary
                        : d.valor >= max * 0.5
                          ? palette.brand[300]
                          : colors.chart.primarySoft
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </SectionCard>
  );
}

export function MaioresGastos() {
  const { analise, loading } = useGestaoCartao();
  return (
    <SectionCard
      title="Maiores gastos do mês"
      subtitle={
        analise && analise.topGastos.length > 0
          ? `Top ${analise.topGastos.length} respondem por ${formatPercent(analise.pctTop5)} do total`
          : undefined
      }
      sx={{ height: '100%' }}
    >
      {loading || !analise ? (
        <Skeleton variant="rounded" height={150} />
      ) : analise.topGastos.length === 0 ? (
        <EmptyState message="Sem dados." compact />
      ) : (
        <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {analise.topGastos.map((t, i) => (
            <Box component="li" key={`${t.nome}-${i}`} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ flex: 1, minWidth: 0, color: 'text.primary' }} noWrap>
                {capitalize(t.nome)}{' '}
                <Box component="span" sx={{ color: 'text.secondary' }}>
                  · {capitalize(t.detalhe)}
                </Box>
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatCurrency(t.valor)}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </SectionCard>
  );
}
