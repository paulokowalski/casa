import type { ReactNode } from 'react';
import { Box, Skeleton, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import LocalCafeOutlinedIcon from '@mui/icons-material/LocalCafeOutlined';
import WeekendOutlinedIcon from '@mui/icons-material/WeekendOutlined';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutlineOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import { SectionCard } from '../../../components/ui/SectionCard';
import { EmptyState } from '../../../components/ui/EmptyState';
import { IconBadge } from '../../../components/ui/IconBadge';
import { StatusPill } from '../../../components/ui/StatusPill';
import { useGestaoCartao } from '../../../contexts/GestaoCartaoContext';
import type { TipoInsight } from '../../../lib/financas/analise';
import { palette, tones, type Tone } from '../../../styles/tokens';
import { formatCurrency } from '../../../utils/format';

const VISUAL: Record<TipoInsight, { icone: ReactNode; tom: Tone }> = {
  categoria: { icone: <TrendingUpIcon />, tom: 'error' },
  recorrente: { icone: <AutorenewIcon />, tom: 'violet' },
  pequenas: { icone: <LocalCafeOutlinedIcon />, tom: 'warning' },
  fimDeSemana: { icone: <WeekendOutlinedIcon />, tom: 'info' },
  segurar: { icone: <PauseCircleOutlineIcon />, tom: 'brand' },
  parcelado: { icone: <ReceiptLongOutlinedIcon />, tom: 'warning' },
  positivo: { icone: <ThumbUpAltOutlinedIcon />, tom: 'success' },
};

const TOM_NOTA = { Saudável: 'success', Atenção: 'warning', Crítico: 'error' } as const;

export function SaudeFinanceira() {
  const { analise, loading } = useGestaoCartao();
  const tom = analise ? tones[TOM_NOTA[analise.score.rotulo]] : tones.neutral;

  return (
    <SectionCard
      title="Saúde financeira"
      subtitle="Nota calculada a partir dos seus lançamentos"
      sx={{ height: '100%' }}
    >
      {loading || !analise ? (
        <Skeleton variant="rounded" height={220} />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
            <Box
              role="img"
              aria-label={`Nota ${analise.score.nota} de 100, ${analise.score.rotulo}`}
              sx={{
                width: 112,
                height: 112,
                borderRadius: '50%',
                flexShrink: 0,
                background: `conic-gradient(${tom.solid} 0 ${analise.score.nota}%, ${palette.gray[100]} ${analise.score.nota}% 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  width: 92,
                  height: 92,
                  borderRadius: '50%',
                  bgcolor: 'background.paper',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ fontSize: 28, fontWeight: 600, lineHeight: 1 }}>{analise.score.nota}</Typography>
                <Typography variant="caption" sx={{ color: tom.fg, fontWeight: 600 }}>
                  {analise.score.rotulo}
                </Typography>
              </Box>
            </Box>
            <Box
              component="ul"
              sx={{
                listStyle: 'none',
                m: 0,
                p: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                flex: 1,
                minWidth: 200,
              }}
            >
              {analise.score.fatores.map((f) => (
                <Box
                  component="li"
                  key={f.texto}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                    fontSize: '0.8125rem',
                    color: 'text.primary',
                  }}
                >
                  {f.ok === true && (
                    <CheckCircleIcon sx={{ fontSize: 18, color: tones.success.solid }} titleAccess="Ok" />
                  )}
                  {f.ok === false && (
                    <ErrorIcon sx={{ fontSize: 18, color: tones.error.solid }} titleAccess="Atenção" />
                  )}
                  {f.ok === null && (
                    <RemoveCircleOutlineIcon sx={{ fontSize: 18, color: palette.gray[400] }} titleAccess="Neutro" />
                  )}
                  <span>{f.texto}</span>
                </Box>
              ))}
            </Box>
          </Box>
          <Box
            sx={{
              bgcolor: 'grey.50',
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 1.5,
              fontSize: '0.8125rem',
            }}
          >
            {analise.score.dica}
          </Box>
        </Box>
      )}
    </SectionCard>
  );
}

export function Insights() {
  const { analise, loading } = useGestaoCartao();

  const acao =
    analise && analise.economiaTotal > 0 ? (
      <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
        <Typography variant="caption">Economia potencial</Typography>
        <Typography sx={{ fontSize: '1.0625rem', fontWeight: 600, color: tones.success.fg }}>
          {formatCurrency(analise.economiaTotal, true)}/mês · {formatCurrency(analise.economiaTotal * 12, true)}/ano
        </Typography>
      </Box>
    ) : undefined;

  return (
    <SectionCard
      title="Onde economizar"
      subtitle="Gerado a partir do seu histórico"
      action={acao}
      sx={{ height: '100%' }}
    >
      {loading || !analise ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={52} />
          ))}
        </Box>
      ) : analise.insights.length === 0 ? (
        <EmptyState message="Sem lançamentos no período para gerar insights." />
      ) : (
        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {analise.insights.map((i, idx) => (
            <Box
              component="li"
              key={i.id}
              sx={{
                display: 'flex',
                gap: 1.5,
                alignItems: 'flex-start',
                py: 1.5,
                borderTop: idx === 0 ? 0 : 1,
                borderColor: 'divider',
                '&:first-of-type': { pt: 0 },
              }}
            >
              <IconBadge tone={VISUAL[i.tipo].tom}>{VISUAL[i.tipo].icone}</IconBadge>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600 }}>{i.titulo}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                  {i.descricao}
                </Typography>
              </Box>
              {i.economia !== null && i.economia > 0 ? (
                <StatusPill tone="success">−{formatCurrency(i.economia, true)}/mês</StatusPill>
              ) : i.destaque ? (
                <StatusPill tone="brand">Dica</StatusPill>
              ) : null}
            </Box>
          ))}
        </Box>
      )}
    </SectionCard>
  );
}
