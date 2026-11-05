import { Box, LinearProgress } from '@mui/material';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import { KpiCard } from '../../../components/ui/KpiCard';
import { StatusPill, TrendPill } from '../../../components/ui/StatusPill';
import { useGestaoFinanceira } from '../../../contexts/GestaoFinanceiraContext';
import { idxParaRef, nomeMes, rotuloMesLongo } from '../../../lib/financas/parcelas';
import type { Tone } from '../../../styles/tokens';
import { formatCurrency, formatPercent } from '../../../utils/format';

export function Resumo() {
  const { analise: a, loading } = useGestaoFinanceira();
  const carregando = loading || !a;

  const diffMedia = a && a.media6 !== null ? a.totalMes - a.media6 : null;
  const orc = a?.orcamento ?? null;
  const tomOrc: Tone = !orc ? 'neutral' : orc.usadoPct > 1 ? 'error' : orc.usadoPct > 0.9 ? 'warning' : 'success';

  return (
    <Box
      component="section"
      aria-label="Indicadores do mês"
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(3, minmax(0, 1fr))',
          lg: 'repeat(5, minmax(0, 1fr))',
        },
        gap: { xs: 1.5, md: 2.5 },
      }}
    >
      <KpiCard
        label="Gasto do mês"
        icon={<CreditCardOutlinedIcon />}
        tone="brand"
        loading={carregando}
        value={a ? formatCurrency(a.totalMes) : '—'}
        footer={
          a && (
            <>
              <TrendPill value={a.variacaoMesAnterior} positiveIsGood={false} />
              <span>vs {nomeMes(idxParaRef(a.refIdx - 1).mes)}</span>
            </>
          )
        }
      />
      <KpiCard
        label="Média 6 meses"
        icon={<ShowChartIcon />}
        tone="violet"
        loading={carregando}
        value={a?.media6 != null ? formatCurrency(a.media6) : '—'}
        footer={
          diffMedia === null
            ? 'Sem histórico suficiente'
            : `${formatCurrency(Math.abs(diffMedia), true)} ${diffMedia > 0 ? 'acima' : 'abaixo'} da média`
        }
      />
      <KpiCard
        label="Parcelas futuras"
        icon={<EventOutlinedIcon />}
        tone="warning"
        loading={carregando}
        value={a ? formatCurrency(a.comprometidoFuturo) : '—'}
        footer={a?.quitadoEmIdx != null ? `quitadas em ${rotuloMesLongo(a.quitadoEmIdx)}` : 'Nenhuma parcela futura'}
      />
      <KpiCard
        label="Terminam este mês"
        icon={<TaskAltIcon />}
        tone="success"
        loading={carregando}
        value={a ? `${a.terminamEsteMes.qtd} compra${a.terminamEsteMes.qtd === 1 ? '' : 's'}` : '—'}
        footer={
          a && a.terminamEsteMes.qtd > 0 ? (
            <StatusPill tone="success">+{formatCurrency(a.terminamEsteMes.libera, true)}/mês</StatusPill>
          ) : (
            'Nenhuma termina'
          )
        }
      />
      <Box sx={{ gridColumn: { xs: '1 / -1', md: 'auto' } }}>
        <KpiCard
          label="Orçamento usado"
          icon={<SavingsOutlinedIcon />}
          tone={tomOrc === 'neutral' ? 'info' : tomOrc}
          loading={carregando}
          value={orc ? formatPercent(orc.usadoPct, 1) : 'Não definido'}
          footer={
            orc ? (
              <Box sx={{ width: '100%' }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, orc.usadoPct * 100)}
                  color={tomOrc === 'error' ? 'error' : tomOrc === 'warning' ? 'warning' : 'primary'}
                  sx={{ height: 8, mb: 0.75 }}
                  aria-label="Orçamento utilizado"
                />
                {orc.restante >= 0
                  ? `Restam ${formatCurrency(orc.restante, true)}`
                  : `Excedeu ${formatCurrency(-orc.restante, true)}`}
                {orc.diasRestantes !== null && ` · ${orc.diasRestantes} dias`}
              </Box>
            ) : (
              'Informe no campo “Orçamento mensal”'
            )
          }
        />
      </Box>
    </Box>
  );
}
