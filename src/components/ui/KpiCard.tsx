import type { ReactNode } from 'react';
import { Box, Paper, Skeleton, Typography } from '@mui/material';
import type { Tone } from '../../styles/tokens';
import { IconBadge } from './IconBadge';

interface KpiCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
  /** Linha inferior: tendência, comparação, barra de progresso… */
  footer?: ReactNode;
  loading?: boolean;
}

/** Card de indicador: rótulo, valor em destaque e rodapé de contexto. */
export function KpiCard({ label, value, icon, tone = 'brand', footer, loading }: Readonly<KpiCardProps>) {
  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: 3, boxShadow: '0 1px 2px rgba(16,24,40,.05)', p: { xs: 2, md: 2.5 }, minWidth: 0 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minHeight: 32 }}>
        {icon && <IconBadge tone={tone}>{icon}</IconBadge>}
        <Typography variant="subtitle2" component="h3" sx={{ lineHeight: 1.3 }}>
          {label}
        </Typography>
      </Box>
      {loading ? (
        <>
          <Skeleton width="65%" height={40} sx={{ mt: 0.5 }} />
          <Skeleton width="45%" />
        </>
      ) : (
        <>
          <Typography
            component="p"
            sx={{
              mt: 1,
              fontSize: { xs: '1.25rem', md: '1.625rem' },
              fontWeight: 600,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              wordBreak: 'break-word',
            }}
          >
            {value}
          </Typography>
          {footer && (
            <Box
              sx={{
                mt: 1.25,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexWrap: 'wrap',
                color: 'text.secondary',
                fontSize: '0.8125rem',
              }}
            >
              {footer}
            </Box>
          )}
        </>
      )}
    </Paper>
  );
}
