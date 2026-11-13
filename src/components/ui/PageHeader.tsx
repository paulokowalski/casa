import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  section?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, section, actions }: Readonly<PageHeaderProps>) {
  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'flex-end' },
        gap: 2,
        flexWrap: 'wrap',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        {section && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, display: { xs: 'none', sm: 'block' } }}>
            {section}
          </Typography>
        )}
        <Typography component="h1" variant="h2" sx={{ fontSize: { xs: '1.375rem', md: '1.5rem' } }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body1"
            sx={{ color: 'text.secondary', mt: 0.5, '&::first-letter': { textTransform: 'uppercase' } }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>{actions}</Box>}
    </Box>
  );
}
