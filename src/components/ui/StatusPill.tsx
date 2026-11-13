import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { tones, type Tone } from '../../styles/tokens';

interface StatusPillProps {
  tone?: Tone;
  children: ReactNode;
  size?: 'sm' | 'md';
  title?: string;
}

export function StatusPill({ tone = 'neutral', children, size = 'md', title }: Readonly<StatusPillProps>) {
  const t = tones[tone];
  return (
    <Box
      component="span"
      title={title}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: size === 'sm' ? 0.75 : 1,
        py: size === 'sm' ? 0 : '2px',
        borderRadius: 999,
        border: `1px solid ${t.border}`,
        bgcolor: t.bg,
        color: t.fg,
        fontSize: size === 'sm' ? '0.6875rem' : '0.75rem',
        fontWeight: 600,
        lineHeight: 1.6,
        whiteSpace: 'nowrap',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {children}
    </Box>
  );
}

interface TrendPillProps {
  value: number | null | undefined;
  positiveIsGood: boolean;
  suffix?: string;
  neutralBelow?: number;
}

export function TrendPill({ value, positiveIsGood, suffix, neutralBelow = 0.005 }: Readonly<TrendPillProps>) {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  const abs = Math.abs(value);
  const neutral = abs < neutralBelow;
  const up = value > 0;
  const tone: Tone = neutral ? 'neutral' : up === positiveIsGood ? 'success' : 'error';
  const pct = (abs * 100).toLocaleString('pt-BR', { maximumFractionDigits: abs < 0.1 ? 1 : 0 });
  return (
    <StatusPill tone={tone}>
      {neutral ? '' : up ? '↑ ' : '↓ '}
      {pct}%{suffix ? ` ${suffix}` : ''}
    </StatusPill>
  );
}
