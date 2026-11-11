import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DailyPoint } from '@/types/analytics';
import { formatShortDate } from '@/lib/dates';
import { Card } from './Card';
import { Skeleton } from './Skeleton';
import { EmptyState } from './StateMessage';
import { chartAxis, tokenColor, tooltipStyle } from './chartTheme';

export interface TrendChartProps {
  data: DailyPoint[];
  loading?: boolean;
  height?: number;
}

const SERIES = [
  { key: 'total', name: 'Turnos', color: 'chart-1' },
  { key: 'completados', name: 'Completados', color: 'chart-2' },
  { key: 'cancelados', name: 'Cancelados', color: 'chart-4' },
] as const;

export function TrendChart({ data, loading = false, height = 280 }: TrendChartProps) {
  const total = data.reduce((acc, d) => acc + d.total, 0);
  return (
    <Card title="Evolución de turnos" description="Volumen diario por estado">
      {loading ? (
        <Skeleton className="w-full" style={{ height }} />
      ) : data.length === 0 ? (
        <EmptyState message="Sin turnos para el rango seleccionado" />
      ) : (
        <figure role="img" aria-label={`Gráfico de áreas: ${total} turnos en ${data.length} días`} style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke={tokenColor('line')} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="fecha" tickFormatter={formatShortDate} {...chartAxis} minTickGap={24} />
              <YAxis allowDecimals={false} {...chartAxis} />
              <Tooltip labelFormatter={(v) => formatShortDate(String(v))} {...tooltipStyle} />
              <Legend wrapperStyle={{ color: tokenColor('content-muted'), fontSize: 12 }} />
              {SERIES.map((s) => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.name}
                  stroke={tokenColor(s.color)}
                  fill={tokenColor(s.color, 0.15)}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </figure>
      )}
    </Card>
  );
}
