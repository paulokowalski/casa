import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { tones, type Tone } from '../../styles/tokens';

interface IconBadgeProps {
  tone?: Tone;
  size?: number;
  children: ReactNode;
}

export function IconBadge({ tone = 'brand', size = 32, children }: Readonly<IconBadgeProps>) {
  const t = tones[tone];
  return (
    <Box
      aria-hidden="true"
      sx={{
        width: size,
        height: size,
        borderRadius: 2,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: t.bg,
        color: t.solid,
        '& svg': { fontSize: Math.round(size * 0.56) },
      }}
    >
      {children}
    </Box>
  );
}
