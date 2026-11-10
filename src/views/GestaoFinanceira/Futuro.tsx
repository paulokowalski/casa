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
import type { TooltipProps } from 'recharts';
import { SectionCard } from '../../components/ui/SectionCard';
import { axisProps, compactNumber, gridProps, yAxisProps } from '../../components/charts/chartTheme';
import { useGestaoFinanceira } from '../../contexts/GestaoFinanceiraContext';
import type { Futuro as Dados, PontoFuturo } from '../../lib/financas/futuro';
import { rotuloMesLongo } from '../../lib/financas/parcelas';
import { palette, tones } from '../../styles/tokens';
import { formatCurrency } from '../../utils/format';

const COR = {
  contas: palette.brand[600],
  parcelas: '#5ab0f6',
  renda: '#12b76a',
};

function Legenda({ cor, texto, tipo }: Readonly<{ cor: string; texto: string; tipo?: 'linha' }>) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '0.75rem', color: 'text.secondary' }}>
      {tipo === 'linha' ? (
        <Box sx={{ width: 14, borderTop: `2px dashed ${cor}` }} />
      ) : (
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '2px',
            bgcolor: cor,
          }}
        />
      )}
      {texto}
    </Box>
  );
}

const sinal = (v: number) => `${v < 0 ? '−' : '+'}${compactNumber(Math.abs(v))}`;
const corSobra = (v: number) => (v >= 0 ? tones.success.fg : tones.error.fg);

function Dica({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as PontoFuturo;
  const linha = (rotulo: string, valor: number, cor?: string) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 0.5, color: cor }}>
      <span style={{ color: cor ?? palette.gray[600] }}>{rotulo}</span>
      <b>{formatCurrency(valor)}</b>
    </Box>
  );
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: `1px solid ${palette.gray[200]}`,
        borderRadius: 2.5,
        boxShadow: '0 12px 16px -4px rgba(16,24,40,.08)',
        px: 1.75,
        py: 1.5,
        minWidth: 220,
        fontSize: '0.75rem',
      }}
    >
      <Typography fontWeight={600} fontSize="0.8125rem" sx={{ mb: 0.5 }}>
        {rotuloMesLongo(p.idx)}
      </Typography>
      {linha('Contas fixas', p.contas)}
      {linha('Parcelas do cartão', p.parcelas)}
      <Box sx={{ borderTop: `1px solid ${palette.gray[100]}`, mt: 0.75, pt: 0.25 }}>
        {linha('Custo total previsto', p.total, palette.gray[900])}
        {p.sobra !== null &&
          linha(p.sobra >= 0 ? 'Sobra da renda' : 'Falta na renda', Math.abs(p.sobra), corSobra(p.sobra))}
      </Box>
    </Box>
  );
}

/** Rótulo em cima de cada barra: o custo total previsto e, com renda informada, a sobra do mês */
const rotuloTopo =
  (pontos: PontoFuturo[]) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (p: any) => {
    const ponto = pontos[p.index];
    if (!ponto || ponto.total <= 0) return null;
    const x = p.x + p.width / 2;
    return (
      <g>
        {ponto.sobra !== null && (
          <text x={x} y={p.y - 21} textAnchor="middle" fontSize={11} fontWeight={600} fill={corSobra(ponto.sobra)}>
            {sinal(ponto.sobra)}
          </text>
        )}
        <text x={x} y={p.y - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill={palette.gray[700]}>
          {compactNumber(ponto.total)}
        </text>
      </g>
    );
  };

/** Celular: uma barra horizontal por mês, com o custo total e a sobra ao lado */
function BarrasCelular({ d }: Readonly<{ d: Dados }>) {
  const escala = Math.max(d.renda ?? 0, ...d.pontos.map((p) => p.total)) || 1;
  const pct = (v: number) => `${(v / escala) * 100}%`;
  return (
    <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
      {d.pontos.map((p) => (
        <Box
          component="li"
          key={p.idx}
          sx={{ display: 'grid', gridTemplateColumns: '48px minmax(0, 1fr) 72px', alignItems: 'center', gap: 1 }}
        >
          <Typography variant="caption" color="text.secondary">
            {p.rotulo}
          </Typography>
          <Box sx={{ display: 'flex', height: 14, borderRadius: '4px', overflow: 'hidden', bgcolor: palette.gray[50] }}>
            <Box sx={{ width: pct(p.contas), bgcolor: COR.contas }} />
            <Box sx={{ width: pct(p.parcelas), bgcolor: COR.parcelas }} />
          </Box>
          <Box sx={{ textAlign: 'right', lineHeight: 1.25 }}>
            <Typography variant="caption" fontWeight={600} sx={{ display: 'block', color: 'text.primary' }}>
              {compactNumber(p.total)}
            </Typography>
            {p.sobra !== null && (
              <Typography variant="caption" fontWeight={600} sx={{ display: 'block', color: corSobra(p.sobra) }}>
                {sinal(p.sobra)}
              </Typography>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

/** Custo e sobra previstos nos próximos 12 meses */
export function Futuro() {
  const { futuro: d } = useGestaoFinanceira();
  const theme = useTheme();
  const celular = useMediaQuery(theme.breakpoints.down('sm'));

  const primeiro = d?.pontos[0];
  const ultimo = d?.pontos.at(-1);
  const periodo =
    primeiro && ultimo
      ? `${rotuloMesLongo(primeiro.idx).toLowerCase()} a ${rotuloMesLongo(ultimo.idx).toLowerCase()}`
      : '';

  return (
    <SectionCard
      title="Custo e sobra previstos nos próximos 12 meses"
      subtitle={
        periodo
          ? `De ${periodo}, só com valores já lançados: contas cadastradas e parcelas do cartão`
          : 'Só com valores já lançados: contas cadastradas e parcelas do cartão'
      }
    >
      {!d ? (
        <Skeleton variant="rounded" height={340} />
      ) : (
        <>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
            <Legenda cor={COR.contas} texto="Contas fixas" />
            <Legenda cor={COR.parcelas} texto="Parcelas do cartão" />
            {d.renda && <Legenda cor={COR.renda} texto="Renda líquida" tipo="linha" />}
            {d.renda && (
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '0.75rem', color: 'text.secondary' }}
              >
                <Box component="b" sx={{ color: tones.success.fg }}>
                  +
                </Box>
                Sobra no mês
              </Box>
            )}
          </Box>

          {celular ? (
            <BarrasCelular d={d} />
          ) : (
            <Box sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={d.pontos} margin={{ top: 36, right: 4, left: -8, bottom: 0 }} barCategoryGap="22%">
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="rotulo" {...axisProps} interval={0} fontSize={11} />
                  <YAxis
                    {...yAxisProps}
                    width={48}
                    tickFormatter={compactNumber}
                    domain={[0, (max: number) => Math.max(max, d.renda ?? 0) * 1.08]}
                  />
                  <Tooltip cursor={{ fill: palette.gray[100] }} content={<Dica />} />
                  {d.renda && <ReferenceLine y={d.renda} stroke={COR.renda} strokeDasharray="6 4" strokeWidth={1.5} />}
                  <Bar dataKey="contas" stackId="f" fill={COR.contas} maxBarSize={44} isAnimationActive={false} />
                  <Bar
                    dataKey="parcelas"
                    stackId="f"
                    fill={COR.parcelas}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={44}
                    isAnimationActive={false}
                  >
                    <LabelList dataKey="total" content={rotuloTopo(d.pontos)} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
            Compras no cartão que ainda não foram feitas não entram na conta.{' '}
            {d.renda
              ? `Em cima de cada barra: o custo total previsto e, acima dele, quanto sobra da renda líquida de ${formatCurrency(d.renda)} (em vermelho quando falta).`
              : 'Em cima de cada barra: o custo total previsto. Informe a renda líquida para ver quanto sobra em cada mês.'}
          </Typography>
        </>
      )}
    </SectionCard>
  );
}
