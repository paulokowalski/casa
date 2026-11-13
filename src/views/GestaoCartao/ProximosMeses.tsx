import { useMemo } from 'react';
import { Box, Skeleton, Typography, useMediaQuery, useTheme } from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipContentProps } from 'recharts';
import { SectionCard } from '../../components/ui/SectionCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusPill } from '../../components/ui/StatusPill';
import { axisProps, compactNumber, gridProps, yAxisProps } from '../../components/charts/chartTheme';
import { useGestaoCartao } from '../../contexts/GestaoCartaoContext';
import { calcularProximosMeses, type ProximosMeses as Dados } from '../../lib/financas/proximosMeses';
import { rotuloMesAno, rotuloMesLongo } from '../../lib/financas/parcelas';
import { palette, tones } from '../../styles/tokens';
import { formatCurrency, formatPercent } from '../../utils/format';

const COR_LIVRE = { fill: tones.success.bg, stroke: '#6ce9a6' };
const COR_PARCELAS = palette.brand[600];

function Numero({ rotulo, valor, rodape }: Readonly<{ rotulo: string; valor: string; rodape: string }>) {
  return (
    <Box sx={{ border: `1px solid ${palette.gray[200]}`, borderRadius: 2.5, px: 1.75, py: 1.5, minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, display: 'block' }}>
        {rotulo}
      </Typography>
      <Typography sx={{ fontSize: { xs: '1.0625rem', md: '1.25rem' }, fontWeight: 600, mt: 0.5 }} noWrap>
        {valor}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
        {rodape}
      </Typography>
    </Box>
  );
}

function Legenda({
  cor,
  texto,
  tracejado,
  livre,
}: Readonly<{ cor: string; texto: string; tracejado?: boolean; livre?: boolean }>) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '0.75rem', color: 'text.secondary' }}>
      {tracejado ? (
        <Box sx={{ width: 14, borderTop: `2px dashed ${cor}` }} />
      ) : (
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '2px',
            bgcolor: cor,
            border: livre ? `1px dashed ${COR_LIVRE.stroke}` : undefined,
          }}
        />
      )}
      {texto}
    </Box>
  );
}

function Dica({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as Dados['pontos'][number];
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: `1px solid ${palette.gray[200]}`,
        borderRadius: 2.5,
        boxShadow: '0 12px 16px -4px rgba(16,24,40,.08)',
        px: 1.75,
        py: 1.5,
        minWidth: 200,
        fontSize: '0.75rem',
      }}
    >
      <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem', mb: 1 }}>{rotuloMesLongo(p.idx)}</Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <span style={{ color: palette.gray[600] }}>Parcelas</span>
        <b>{formatCurrency(p.total)}</b>
      </Box>
      {p.livre > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 0.5, color: tones.success.fg }}>
          <span>Livre no orçamento</span>
          <b>{formatCurrency(p.livre)}</b>
        </Box>
      )}
    </Box>
  );
}

const totalNoTopo =
  (pontos: Dados['pontos'], naBaseDoLivre: boolean) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (p: any) => {
    const ponto = pontos[p.index];
    if (!ponto?.total) return null;
    const temLivre = ponto.livre > 0;
    if (naBaseDoLivre !== temLivre) return null;
    const y = naBaseDoLivre ? p.y + p.height : p.y;
    return (
      <text x={p.x + p.width / 2} y={y - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill={palette.gray[700]}>
        {compactNumber(ponto.total)}
      </text>
    );
  };

function BarrasCelular({ d }: Readonly<{ d: Dados }>) {
  const escala = Math.max(d.orcamento ?? 0, ...d.pontos.map((p) => p.total)) || 1;
  const pct = (v: number) => `${(v / escala) * 100}%`;
  return (
    <Box
      component="ul"
      sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 1 }}
      aria-label="Parcelas por mês"
    >
      {d.pontos.map((p) => (
        <Box
          component="li"
          key={p.idx}
          sx={{ display: 'grid', gridTemplateColumns: '48px minmax(0, 1fr) 74px', alignItems: 'center', gap: 1 }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {rotuloMesAno(p.idx)}
          </Typography>
          <Box sx={{ display: 'flex', height: 14, borderRadius: '4px', overflow: 'hidden', bgcolor: palette.gray[50] }}>
            {p.total > 0 && <Box sx={{ width: pct(p.total), bgcolor: COR_PARCELAS }} />}
            {p.livre > 0 && (
              <Box
                title={`Livre: ${formatCurrency(p.livre)}`}
                sx={{
                  width: pct(p.livre),
                  bgcolor: COR_LIVRE.fill,
                  border: `1px dashed ${COR_LIVRE.stroke}`,
                  boxSizing: 'border-box',
                }}
              />
            )}
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 600, textAlign: 'right' }}>
            {p.total > 0 ? formatCurrency(p.total, true) : '—'}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export function ProximosMeses() {
  const { proximos, orcamento } = useGestaoCartao();
  const theme = useTheme();
  const celular = useMediaQuery(theme.breakpoints.down('sm'));

  const d = useMemo(() => (proximos ? calcularProximosMeses(proximos, orcamento) : null), [proximos, orcamento]);

  const primeiro = d?.pontos[0];
  const ultimo = d?.pontos.at(-1);
  const periodo =
    primeiro && ultimo
      ? `${rotuloMesLongo(primeiro.idx).toLowerCase()} a ${rotuloMesLongo(ultimo.idx).toLowerCase()}`
      : '';

  let livreDeParcelas = { valor: '—', rodape: 'sem parcelas futuras' };
  if (d?.livreDeParcelasIdx != null) {
    livreDeParcelas = d.continuaDepois
      ? { valor: `Após ${rotuloMesAno(ultimo!.idx)}`, rodape: 'ainda há parcelas depois' }
      : { valor: rotuloMesAno(d.livreDeParcelasIdx), rodape: 'se não houver compras novas' };
  }

  return (
    <SectionCard
      title="Próximos 12 meses no cartão"
      subtitle={
        periodo
          ? `Parcelas já assumidas de ${periodo}${d?.orcamento ? ' e quanto sobra do orçamento para compras novas' : ''}`
          : 'Parcelas já assumidas nos próximos meses'
      }
    >
      {!d ? (
        <Skeleton variant="rounded" height={380} />
      ) : d.comprometido === 0 ? (
        <EmptyState message="Nenhuma parcela assumida para os próximos 12 meses." />
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
              gap: 1.5,
            }}
          >
            <Numero
              rotulo="Já comprometido em 12 meses"
              valor={formatCurrency(d.comprometido)}
              rodape={`parcelas de ${d.qtdCompras} compra${d.qtdCompras === 1 ? '' : 's'}`}
            />
            <Numero
              rotulo="Média por mês"
              valor={formatCurrency(d.media)}
              rodape={d.orcamento ? `${formatPercent(d.media / d.orcamento)} do orçamento` : 'nos 12 meses'}
            />
            <Numero
              rotulo="Mês mais pesado"
              valor={d.maisPesado ? rotuloMesAno(d.maisPesado.idx) : '—'}
              rodape={d.maisPesado ? `${formatCurrency(d.maisPesado.total)} em parcelas` : ''}
            />
            <Numero rotulo="Cartão livre de parcelas" valor={livreDeParcelas.valor} rodape={livreDeParcelas.rodape} />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2.25 }}>
            <Legenda cor={COR_PARCELAS} texto="Parcelas do mês" />
            {d.orcamento && (
              <>
                <Legenda cor={COR_LIVRE.fill} texto="Livre para compras novas" livre />
                <Legenda cor={tones.error.solid} texto="Orçamento mensal" tracejado />
              </>
            )}
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 300px' },
              gap: 3,
              mt: 1.5,
            }}
          >
            {celular ? (
              <BarrasCelular d={d} />
            ) : (
              <Box sx={{ height: 330, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={d.pontos} margin={{ top: 8, right: 4, left: -8, bottom: 0 }} barCategoryGap="22%">
                    <CartesianGrid {...gridProps} />
                    <XAxis dataKey="rotulo" {...axisProps} interval={0} fontSize={11} />
                    <YAxis {...yAxisProps} width={48} tickFormatter={compactNumber} />
                    <Tooltip cursor={{ fill: palette.gray[100] }} content={Dica} />
                    {d.orcamento && (
                      <ReferenceLine
                        zIndex={250}
                        y={d.orcamento}
                        stroke={tones.error.solid}
                        strokeDasharray="6 4"
                        strokeWidth={1.5}
                      />
                    )}
                    <Bar
                      dataKey="total"
                      name="Parcelas"
                      stackId="p"
                      fill={COR_PARCELAS}
                      maxBarSize={44}
                      radius={d.orcamento ? undefined : [4, 4, 0, 0]}
                      isAnimationActive={false}
                    >
                      <LabelList dataKey="total" content={totalNoTopo(d.pontos, false)} />
                    </Bar>
                    {d.orcamento && (
                      <Bar
                        dataKey="livre"
                        name="Livre"
                        stackId="p"
                        fill={COR_LIVRE.fill}
                        stroke={COR_LIVRE.stroke}
                        strokeDasharray="4 3"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={44}
                        isAnimationActive={false}
                      >
                        <LabelList dataKey="total" content={totalNoTopo(d.pontos, true)} />
                      </Bar>
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}

            <Box
              sx={{
                borderLeft: { lg: `1px solid ${palette.gray[100]}` },
                borderTop: { xs: `1px solid ${palette.gray[100]}`, lg: 'none' },
                pl: { lg: 2.5 },
                pt: { xs: 2, lg: 0 },
                minWidth: 0,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Quando cada parcelamento termina
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                E quanto libera por mês a partir dali
              </Typography>
              {d.terminam.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5 }}>
                  Nenhum parcelamento termina nos próximos 12 meses.
                </Typography>
              ) : (
                <Box component="ol" sx={{ listStyle: 'none', m: 0, mt: 1, p: 0, maxHeight: 300, overflowY: 'auto' }}>
                  {d.terminam.map((t) => (
                    <Box
                      component="li"
                      key={`${t.idx}-${t.nome}-${t.cartao}`}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '52px minmax(0, 1fr) auto',
                        gap: 1.25,
                        alignItems: 'center',
                        py: 1.25,
                        borderTop: `1px solid ${palette.gray[100]}`,
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        {rotuloMesAno(t.idx)}
                      </Typography>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap title={t.nome}>
                          {t.nome}
                        </Typography>
                        <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block' }}>
                          {t.cartao} · {t.parcela}
                        </Typography>
                      </Box>
                      <StatusPill tone="success">+{formatCurrency(t.libera, true)}</StatusPill>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </>
      )}
    </SectionCard>
  );
}
