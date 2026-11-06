import { Box, Skeleton, Typography } from '@mui/material';
import { SectionCard } from '../../components/ui/SectionCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusPill } from '../../components/ui/StatusPill';
import { useGestaoFinanceira } from '../../contexts/GestaoFinanceiraContext';
import { chartPalette, palette } from '../../styles/tokens';
import { formatCurrency, formatPercent } from '../../utils/format';

const COR_CARTAO = '#5ab0f6';
const coresGrupos = chartPalette.filter((c) => c !== COR_CARTAO);

/** Para onde vai o dinheiro: contas por categoria + cartão */
export function ParaOndeVai() {
  const { visao: v, loading } = useGestaoFinanceira();
  const total = v?.totalMes || 1;
  let k = 0;
  const grupos = (v?.grupos ?? []).map((g) => ({
    ...g,
    cor: g.cartao ? COR_CARTAO : coresGrupos[k++ % coresGrupos.length],
  }));

  return (
    <SectionCard
      title="Para onde vai o dinheiro"
      subtitle={v ? `${formatCurrency(v.totalMes)} no mês, por grupo` : undefined}
      sx={{ height: '100%' }}
    >
      {loading && !v ? (
        <Skeleton variant="rounded" height={220} />
      ) : grupos.length === 0 ? (
        <EmptyState message="Nenhuma conta ou gasto no cartão neste mês." />
      ) : (
        <>
          <Box
            sx={{ display: 'flex', height: 14, gap: '2px', mb: 2 }}
            role="img"
            aria-label={grupos.map((g) => `${g.nome} ${formatPercent(g.valor / total)}`).join(', ')}
          >
            {grupos.map((g) => (
              <Box key={g.nome} sx={{ width: `${(g.valor / total) * 100}%`, bgcolor: g.cor, borderRadius: '4px' }} />
            ))}
          </Box>
          <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {grupos.map((g) => (
              <Box
                component="li"
                key={g.nome}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  py: 1.25,
                  borderTop: `1px solid ${palette.gray[100]}`,
                }}
              >
                <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: g.cor, flexShrink: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={500} component="span">
                    {g.nome}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" component="span" noWrap>
                    {' · '}
                    {g.itens.join(', ')}
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight={600}>
                  {formatCurrency(g.valor)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ width: 44, textAlign: 'right' }}>
                  {formatPercent(g.valor / total)}
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}
    </SectionCard>
  );
}

const CORES_REGRA = [palette.brand[600], COR_CARTAO, '#12b76a'];

/** Renda dividida na regra 50/30/20 */
export function Equilibrio() {
  const { visao: v, loading } = useGestaoFinanceira();
  const regra = v?.regra;
  const dentro = regra?.every((r) => (r.acimaEhBom ? r.pct >= r.meta : r.pct <= r.meta + 0.005));

  return (
    <SectionCard
      title="Equilíbrio do orçamento"
      subtitle="Sua renda dividida na regra 50/30/20"
      action={
        regra ? (
          <StatusPill tone={dentro ? 'success' : 'warning'}>{dentro ? 'Dentro da meta' : 'Fora da meta'}</StatusPill>
        ) : undefined
      }
      sx={{ height: '100%' }}
    >
      {loading && !v ? (
        <Skeleton variant="rounded" height={220} />
      ) : !regra ? (
        <EmptyState message="Informe a renda líquida do mês no filtro para ver o equilíbrio do orçamento." />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.75, pt: 0.5 }}>
          {regra.map((r, i) => {
            const ok = r.acimaEhBom ? r.pct >= r.meta : r.pct <= r.meta + 0.005;
            return (
              <Box key={r.nome}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="body2">
                    <b>{r.nome}</b>{' '}
                    <Typography component="span" variant="body2" color="text.secondary">
                      · {r.descricao}
                    </Typography>
                  </Typography>
                  <Typography variant="body2">
                    <b style={{ color: ok ? undefined : palette.warning[700] }}>{formatPercent(r.pct, 1)}</b>{' '}
                    <Typography component="span" variant="body2" color="text.secondary">
                      meta {r.acimaEhBom ? '≥' : '≤'} {formatPercent(r.meta)}
                    </Typography>
                  </Typography>
                </Box>
                <Box sx={{ position: 'relative', mt: 1 }}>
                  <Box sx={{ height: 10, borderRadius: 99, bgcolor: palette.gray[100], overflow: 'hidden' }}>
                    <Box
                      sx={{
                        width: `${Math.min(100, r.pct * 100)}%`,
                        height: '100%',
                        bgcolor: CORES_REGRA[i],
                        borderRadius: 99,
                      }}
                    />
                  </Box>
                  <Box
                    aria-hidden
                    sx={{
                      position: 'absolute',
                      top: -4,
                      left: `${r.meta * 100}%`,
                      width: 2,
                      height: 18,
                      bgcolor: palette.gray[900],
                      borderRadius: 1,
                    }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                  {formatCurrency(r.valor)} de {formatCurrency(v?.renda ?? 0)}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </SectionCard>
  );
}
