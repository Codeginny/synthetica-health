'use client';

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { SpecialtyPoint } from '@/types/analytics';
import { Card } from './Card';
import { Skeleton } from './Skeleton';
import { EmptyState } from './StateMessage';
import { chartAxis, tokenColor, tooltipStyle } from './chartTheme';

export interface SpecialtyChartProps {
  data: SpecialtyPoint[];
  loading?: boolean;
  height?: number;
}

export function SpecialtyChart({ data, loading = false, height = 280 }: SpecialtyChartProps) {
  const top = [...data].sort((a, b) => b.cancelados - a.cancelados)[0];
  return (
    <Card title="Cancelaciones por especialidad" description="Detecta dónde se concentra el ausentismo">
      {loading ? (
        <Skeleton className="w-full" style={{ height }} />
      ) : data.length === 0 ? (
        <EmptyState message="Sin datos por especialidad" />
      ) : (
        <figure
          role="img"
          aria-label={`Gráfico de barras por especialidad. Mayor cancelación: ${top?.especialidad} con ${top?.cancelados}`}
          style={{ height }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke={tokenColor('line')} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="especialidad" {...chartAxis} />
              <YAxis allowDecimals={false} {...chartAxis} />
              <Tooltip cursor={{ fill: tokenColor('brand-200', 0.25) }} {...tooltipStyle} />
              <Legend wrapperStyle={{ color: tokenColor('content-muted'), fontSize: 12 }} />
              <Bar dataKey="total" name="Turnos" fill={tokenColor('chart-2')} radius={[6, 6, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="cancelados" name="Cancelados" fill={tokenColor('chart-3')} radius={[6, 6, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </figure>
      )}
    </Card>
  );
}
