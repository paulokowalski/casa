import { Box, Skeleton, Typography, useMediaQuery, useTheme } from '@mui/material';
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
import { StatusPill } from '../../../components/ui/StatusPill';
import { CategoryBars } from '../../../components/charts/CategoryBars';
import { ShareBar } from '../../../components/charts/ShareBar';
import { axisProps, compactNumber, gridProps, tooltipProps, yAxisProps } from '../../../components/charts/chartTheme';
import { useGestaoFinanceira } from '../../../contexts/GestaoFinanceiraContext';
import { idxParaRef, rotuloMes, rotuloMesLongo } from '../../../lib/financas/parcelas';
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

// ---------------------------------------------------------------- Evolução
export function EvolucaoMensal() {
  const { analise, loading } = useGestaoFinanceira();
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
              <Tooltip {...tooltipProps} formatter={(v: number) => [formatCurrency(v), 'Gasto']} />
              {analise.orcamento && (
                <ReferenceLine
                  y={analise.orcamento.valor}
                  stroke={tones.error.solid}
                  strokeDasharray="6 4"
                  strokeWidth={1.5}
                />
              )}
              {analise.media6 && (
                <ReferenceLine y={analise.media6} stroke={palette.gray[400]} strokeDasharray="6 4" strokeWidth={1.5} />
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

// ---------------------------------------------------------------- Categorias
export function PorCategoria({
  selecionada,
  onSelecionar,
}: Readonly<{ selecionada: string | null; onSelecionar: (c: string | null) => void }>) {
  const { analise, loading } = useGestaoFinanceira();
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

// ---------------------------------------------------------------- Projeção
export function ProjecaoCompromissos() {
  const { analise, loading } = useGestaoFinanceira();
  const theme = useTheme();
  const celular = useMediaQuery(theme.breakpoints.down('sm'));

  let selo = null;
  if (analise) {
    const atual = analise.projecao12[0]?.valor || 0;
    const em6 = analise.projecao12[6]?.valor || 0;
    if (atual > 0 && em6 < atual)
      selo = <StatusPill tone="warning">Cai {formatPercent((atual - em6) / atual)} em 6 meses</StatusPill>;
  }

  return (
    <SectionCard
      title="Projeção de compromissos futuros"
      subtitle="Parcelas já assumidas para os próximos 12 meses · em verde, o que é liberado"
      action={selo}
    >
      {loading || !analise ? (
        <Skeleton variant="rounded" height={240} />
      ) : (
        <Box sx={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analise.projecao12} margin={{ top: 22, right: 4, left: -8, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="rotulo" {...axisProps} interval={celular ? 1 : 0} fontSize={11} />
              <YAxis {...yAxisProps} width={44} tickFormatter={compactNumber} />
              <Tooltip
                {...tooltipProps}
                formatter={(v: number, _n, p) => [
                  `${formatCurrency(v)}${p?.payload?.libera ? ` (libera ${formatCurrency(p.payload.libera)})` : ''}`,
                  p?.payload?.idx === analise.refIdx ? 'Parcelado no mês' : 'Comprometido',
                ]}
              />
              {analise.orcamento && (
                <ReferenceLine
                  y={analise.orcamento.valor * 0.3}
                  stroke={tones.error.solid}
                  strokeDasharray="6 4"
                  label={{ value: '30% do orçamento', position: 'insideTopRight', fontSize: 11, fill: tones.error.fg }}
                />
              )}
              <Bar dataKey="valor" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {analise.projecao12.map((p, i) => (
                  <Cell key={p.idx} fill={i === 0 ? colors.chart.primary : colors.chart.secondary} />
                ))}
                {!celular && <LabelList dataKey="libera" content={valorNoTopo(null, tones.success.fg, '−')} />}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </SectionCard>
  );
}

// ---------------------------------------------------------------- Próximas a terminar
export function ProximasParcelas() {
  const { analise, loading } = useGestaoFinanceira();
  return (
    <SectionCard
      title="Próximas parcelas a terminar"
      subtitle="Dinheiro que volta para o seu bolso"
      sx={{ height: '100%' }}
    >
      {loading || !analise ? (
        <Skeleton variant="rounded" height={240} />
      ) : analise.proximasTerminar.length === 0 ? (
        <EmptyState message="Nenhuma compra parcelada em andamento." />
      ) : (
        <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 1.75 }}>
          {analise.proximasTerminar.map((p) => {
            const esteMes = p.fimIdx === analise.refIdx;
            return (
              <Box
                component="li"
                key={`${p.nome}-${p.fimIdx}-${p.total}`}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
              >
                <Box sx={{ minWidth: 60 }} title={rotuloMesLongo(p.fimIdx)}>
                  <StatusPill tone={esteMes ? 'success' : 'neutral'}>
                    {rotuloMes(p.fimIdx, idxParaRef(analise.refIdx).ano)}
                  </StatusPill>
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={500} noWrap sx={{ color: 'text.primary' }}>
                    {capitalize(p.nome)} · {p.parcelaAtual}/{p.total}
                  </Typography>
                  <Box sx={{ mt: 0.75, height: 6, borderRadius: 99, bgcolor: palette.gray[100], overflow: 'hidden' }}>
                    <Box
                      sx={{
                        width: `${p.progresso * 100}%`,
                        height: '100%',
                        bgcolor: esteMes ? tones.success.solid : tones.warning.solid,
                      }}
                    />
                  </Box>
                </Box>
                <Typography variant="body2" fontWeight={600}>
                  +{formatCurrency(p.valorParcela, true)}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </SectionCard>
  );
}

// ---------------------------------------------------------------- Distribuições
export function PorCartao() {
  const { analise, loading } = useGestaoFinanceira();
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
  const { analise, loading } = useGestaoFinanceira();
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
              <Tooltip {...tooltipProps} formatter={(v: number) => [formatCurrency(v), 'Gasto']} />
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
  const { analise, loading } = useGestaoFinanceira();
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
              <Typography variant="body2" fontWeight={600}>
                {formatCurrency(t.valor)}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </SectionCard>
  );
}
