'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { SpecialtyPoint } from '@/types/analytics';
import { formatCurrency } from '@/lib/dates';
import { Card } from './Card';
import { Skeleton } from './Skeleton';
import { EmptyState } from './StateMessage';
import { chartAxis, tokenColor, tooltipStyle } from './chartTheme';

export interface LostRevenueChartProps {
  data: SpecialtyPoint[];
  loading?: boolean;
  height?: number;
}

export function LostRevenueChart({ data, loading = false, height = 260 }: LostRevenueChartProps) {
  const sorted = [...data].filter((e) => e.perdida > 0).sort((a, b) => b.perdida - a.perdida);
  const total = sorted.reduce((acc, e) => acc + e.perdida, 0);
  return (
    <Card title="Facturación perdida por especialidad" description={`Lo que no se cobró por faltas: ${formatCurrency(total)} en el período`}>
      {loading ? (
        <Skeleton className="w-full" style={{ height }} />
      ) : sorted.length === 0 ? (
        <EmptyState message="Sin faltas en el período: no hay facturación perdida" />
      ) : (
        <figure
          role="img"
          aria-label={`Barras horizontales en pesos. Mayor pérdida: ${sorted[0]?.especialidad} con ${formatCurrency(sorted[0]?.perdida ?? 0)}`}
          style={{ height }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid stroke={tokenColor('line')} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={(v: number) => formatCurrency(v, true)} {...chartAxis} />
              <YAxis type="category" dataKey="especialidad" width={96} {...chartAxis} />
              <Tooltip
                formatter={(v) => [formatCurrency(Number(v)), 'Facturación perdida']}
                cursor={{ fill: tokenColor('brand-200', 0.25) }}
                {...tooltipStyle}
              />
              <Bar dataKey="perdida" name="Facturación perdida" fill={tokenColor('chart-3')} radius={[0, 6, 6, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </figure>
      )}
    </Card>
  );
}
