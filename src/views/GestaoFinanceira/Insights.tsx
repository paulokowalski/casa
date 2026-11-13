import type { ReactNode } from 'react';
import { Box, Skeleton, Typography } from '@mui/material';
import { createSvgIcon } from '@mui/material/utils';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { SectionCard } from '../../components/ui/SectionCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { IconBadge } from '../../components/ui/IconBadge';
import { StatusPill } from '../../components/ui/StatusPill';
import { useGestaoFinanceira } from '../../contexts/GestaoFinanceiraContext';
import type { Insight } from '../../lib/financas/visaoMensal';
import { palette, tones } from '../../styles/tokens';
import { formatCurrency } from '../../utils/format';

const CheckCircleOutlineIcon = createSvgIcon(
  <path d="M16.59 7.58 10 14.17l-3.59-3.58L5 12l5 5 8-8zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8" />,
  'CheckCircleOutline',
);

function icone(i: Insight): ReactNode {
  if (i.id.startsWith('cartao') || i.id.startsWith('reajuste')) return <TrendingUpIcon />;
  if (i.id === 'sobra' || i.id === 'renda') return <ReportProblemOutlinedIcon />;
  if (i.id === 'terminam') return <CheckCircleOutlineIcon />;
  if (i.id.startsWith('subindo')) return <WaterDropOutlinedIcon />;
  if (i.id === 'concentrados') return <ScheduleIcon />;
  if (i.id.startsWith('antecipar') || i.id.startsWith('juros')) return <DirectionsCarOutlinedIcon />;
  return <EditNoteIcon />;
}

export function Insights() {
  const { visao: v, loading } = useGestaoFinanceira();

  return (
    <SectionCard
      title="Onde economizar"
      subtitle="Gerado a partir das suas contas e do cartão"
      action={
        v && v.economiaPossivel > 0 ? (
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Economia possível
            </Typography>
            <Typography sx={{ fontWeight: 700, color: tones.success.fg, fontSize: '1.125rem', lineHeight: 1.2 }}>
              até {formatCurrency(v.economiaPossivel, true)}/mês
            </Typography>
          </Box>
        ) : undefined
      }
      sx={{ height: '100%' }}
    >
      {loading && !v ? (
        <Skeleton variant="rounded" height={280} />
      ) : !v || v.insights.length === 0 ? (
        <EmptyState message="Nenhum alerta neste mês. Continue assim!" />
      ) : (
        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {v.insights.map((i) => (
            <Box
              component="li"
              key={i.id}
              sx={{
                display: 'flex',
                gap: 1.5,
                alignItems: 'flex-start',
                py: 1.75,
                borderTop: `1px solid ${palette.gray[100]}`,
              }}
            >
              <IconBadge tone={i.tone}>{icone(i)}</IconBadge>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {i.titulo}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25, lineHeight: 1.5 }}>
                  {i.texto}
                </Typography>
              </Box>
              <StatusPill tone={i.tone}>{i.tag}</StatusPill>
            </Box>
          ))}
        </Box>
      )}
    </SectionCard>
  );
}
