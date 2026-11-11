/** Recharts no lee clases Tailwind: se resuelven los tokens CSS en runtime. */
export const tokenColor = (name: string, alpha = 1): string => `rgb(var(--${name}) / ${alpha})`;

export const chartAxis = {
  stroke: tokenColor('content-subtle'),
  tick: { fill: tokenColor('content-muted'), fontSize: 12 },
  tickLine: false,
  axisLine: false,
} as const;

export const tooltipStyle = {
  contentStyle: {
    background: tokenColor('surface-raised'),
    border: `1px solid ${tokenColor('line')}`,
    borderRadius: 10,
    color: tokenColor('content'),
  },
  labelStyle: { color: tokenColor('content') },
} as const;
