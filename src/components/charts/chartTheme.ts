import { palette, radius, shadow, surface, text } from '../../styles/tokens';

/** Configuração visual comum dos gráficos (recharts). */
export const axisTick = { fill: text.muted, fontSize: 12 };

export const axisProps = {
  tick: axisTick,
  tickLine: false,
  axisLine: { stroke: surface.border },
} as const;

export const yAxisProps = {
  tick: axisTick,
  tickLine: false,
  axisLine: false,
} as const;

export const gridProps = {
  strokeDasharray: '3 3',
  stroke: palette.gray[100],
  vertical: false,
} as const;

export const tooltipProps = {
  contentStyle: {
    background: palette.white,
    border: `1px solid ${surface.border}`,
    borderRadius: radius.md,
    boxShadow: shadow.lg,
    fontSize: 13,
    color: text.primary,
  },
  labelStyle: { color: text.secondary, fontWeight: 500, marginBottom: 4 },
  cursor: { fill: palette.gray[100], opacity: 0.6 },
} as const;

/** "4,5k" para valores ≥ 1000 */
export const compactNumber = (v: number) =>
  Math.abs(v) >= 1000 ? `${(v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k` : String(Math.round(v));
