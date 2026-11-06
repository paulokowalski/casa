import { Box } from '@mui/material';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import { KpiCard } from '../../components/ui/KpiCard';
import { StatusPill, TrendPill } from '../../components/ui/StatusPill';
import { useGestaoFinanceira } from '../../contexts/GestaoFinanceiraContext';
import { formatCurrency, formatDateBR, formatPercent } from '../../utils/format';

export function Resumo() {
  const { visao: v, loading } = useGestaoFinanceira();
  const carregando = loading && !v;
  const plural = (n: number, s: string) => `${n} ${s}${n === 1 ? '' : 's'}`;

  return (
    <Box
      component="section"
      aria-label="Indicadores do mês"
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(3, minmax(0, 1fr))',
          xl: 'repeat(5, minmax(0, 1fr))',
        },
        gap: { xs: 1.5, md: 2.5 },
        '& > :first-of-type': { gridColumn: { xs: '1 / -1', md: 'auto' } },
      }}
    >
      <KpiCard
        label="Total do mês"
        icon={<PaidOutlinedIcon />}
        tone="brand"
        loading={carregando}
        value={formatCurrency(v?.totalMes ?? 0)}
        footer={
          v?.variacaoTotal != null ? (
            <>
              <TrendPill value={v.variacaoTotal} positiveIsGood={false} />
              <span>vs mês anterior</span>
            </>
          ) : (
            'Contas fixas + cartão'
          )
        }
      />
      <KpiCard
        label="Contas fixas"
        icon={<HomeOutlinedIcon />}
        tone="violet"
        loading={carregando}
        value={formatCurrency(v?.contasMes ?? 0)}
        footer={
          v && v.totalMes > 0
            ? `${plural(v.qtdContas, 'conta')} · ${formatPercent(v.contasMes / v.totalMes)} do total`
            : plural(v?.qtdContas ?? 0, 'conta')
        }
      />
      <KpiCard
        label="Cartão de crédito"
        icon={<CreditCardOutlinedIcon />}
        tone="warning"
        loading={carregando}
        value={formatCurrency(v?.cartaoMes ?? 0)}
        footer={
          v?.mediaCartao6 ? (
            <>
              <TrendPill value={v.cartaoMes / v.mediaCartao6 - 1} positiveIsGood={false} />
              <span>vs média de 6 meses</span>
            </>
          ) : (
            plural(v?.qtdCartao ?? 0, 'lançamento')
          )
        }
      />
      <KpiCard
        label="Sobra do mês"
        icon={<SavingsOutlinedIcon />}
        tone={v?.sobra != null && v.sobra < 0 ? 'error' : 'success'}
        loading={carregando}
        value={v?.sobra != null ? formatCurrency(v.sobra) : 'Informe a renda'}
        footer={
          v?.sobraPct != null ? (
            <>
              <StatusPill tone={v.sobraPct >= 0.2 ? 'success' : v.sobraPct >= 0.1 ? 'warning' : 'error'}>
                {formatPercent(v.sobraPct)} da renda
              </StatusPill>
              <span>meta: 20%</span>
            </>
          ) : (
            'Campo “Renda líquida do mês”'
          )
        }
      />
      <KpiCard
        label="Contas a pagar"
        icon={<EventOutlinedIcon />}
        tone="error"
        loading={carregando}
        value={formatCurrency(v?.aPagar ?? 0)}
        footer={
          v && v.qtdAPagar > 0
            ? `${plural(v.qtdAPagar, 'conta')}${v.proximoVencimento ? ` · próxima ${formatDateBR(v.proximoVencimento).slice(0, 5)}` : ''}`
            : 'Tudo pago'
        }
      />
    </Box>
  );
}
