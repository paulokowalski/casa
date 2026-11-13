import type { ReactNode } from 'react';
import { Box, Paper, Typography, type SxProps, type Theme } from '@mui/material';

interface SectionCardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  padding?: 'default' | 'flush';
  children: ReactNode;
  sx?: SxProps<Theme>;
  'aria-label'?: string;
}

export function SectionCard({
  title,
  subtitle,
  action,
  padding = 'default',
  children,
  sx,
  ...rest
}: Readonly<SectionCardProps>) {
  const hasHeader = Boolean(title || subtitle || action);
  const flush = padding === 'flush';

  return (
    <Paper
      component="section"
      variant="outlined"
      aria-label={rest['aria-label']}
      sx={[
        {
          borderRadius: 3,
          boxShadow: '0 1px 2px rgba(16,24,40,.05)',
          minWidth: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {hasHeader && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 2,
            flexWrap: 'wrap',
            px: { xs: 2, md: 3 },
            pt: { xs: 2, md: 2.5 },
            pb: flush ? 2 : 0,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            {title && (
              <Typography component="h2" variant="h5">
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {action}
        </Box>
      )}
      <Box
        sx={
          flush
            ? { flex: 1 }
            : { flex: 1, px: { xs: 2, md: 3 }, pb: { xs: 2, md: 2.5 }, pt: hasHeader ? 2 : { xs: 2, md: 2.5 } }
        }
      >
        {children}
      </Box>
    </Paper>
  );
}
