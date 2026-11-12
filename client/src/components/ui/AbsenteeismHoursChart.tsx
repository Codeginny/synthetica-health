'use client';

import { Bar, CartesianGrid, Cell, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DayShiftPoint, HourPoint } from '@/types/analytics';
import { FRANJAS } from '@/types/analytics';
import { criticalHours, DAY_NAMES } from '@/features/dashboard/aggregate';
import { Card } from './Card';
import { Skeleton } from './Skeleton';
import { EmptyState } from './StateMessage';
import { chartAxis, tokenColor, tooltipStyle } from './chartTheme';

export interface AbsenteeismHoursChartProps {
  porHora: HourPoint[];
  porDiaFranja: DayShiftPoint[];
  /** Tasa general del período (0–100): referencia para marcar horas críticas. */
  promedio: number;
  loading?: boolean;
  height?: number;
}

const pct = (n: number) => `${n.toLocaleString('es-AR', { maximumFractionDigits: 1 })}%`;

export function AbsenteeismHoursChart({ porHora, porDiaFranja, promedio, loading = false, height = 260 }: AbsenteeismHoursChartProps) {
  const critical = criticalHours(porHora, promedio);
  const dias = [...new Set(porDiaFranja.map((s) => s.dia))].sort((a, b) => a - b);
  const maxTasa = Math.max(1, ...porDiaFranja.map((s) => s.tasa));
  const cell = (dia: number, franja: string) => porDiaFranja.find((s) => s.dia === dia && s.franja === franja);

  return (
    <Card title="Horarios críticos de ausentismo" description="Turnos y % de faltas por hora; las horas críticas se resaltan">
      {loading ? (
        <Skeleton className="w-full" style={{ height }} />
      ) : porHora.length === 0 ? (
        <EmptyState message="Sin turnos para analizar horarios" />
      ) : (
        <>
          <figure
            role="img"
            aria-label={`Gráfico por hora. Horas críticas: ${critical.length ? critical.map((h) => `${h} h`).join(', ') : 'ninguna'}. Promedio ${pct(promedio)}`}
            style={{ height }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={porHora} margin={{ top: 8, right: 0, left: -16, bottom: 0 }}>
                <CartesianGrid stroke={tokenColor('line')} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hora" tickFormatter={(h: number) => `${h} h`} {...chartAxis} />
                <YAxis yAxisId="turnos" allowDecimals={false} {...chartAxis} />
                <YAxis yAxisId="tasa" orientation="right" unit="%" {...chartAxis} />
                <Tooltip
                  labelFormatter={(h) => `${String(h)} h${critical.includes(Number(h)) ? ' · crítica' : ''}`}
                  formatter={(v, name) => (name === '% de faltas' ? pct(Number(v)) : String(v))}
                  cursor={{ fill: tokenColor('brand-200', 0.25) }}
                  {...tooltipStyle}
                />
                <Legend wrapperStyle={{ color: tokenColor('content-muted'), fontSize: 12 }} />
                <Bar yAxisId="turnos" dataKey="total" name="Turnos" radius={[6, 6, 0, 0]} isAnimationActive={false} fill={tokenColor('chart-2')}>
                  {porHora.map((h) => (
                    <Cell key={h.hora} fill={tokenColor(critical.includes(h.hora) ? 'chart-3' : 'chart-2', critical.includes(h.hora) ? 1 : 0.55)} />
                  ))}
                </Bar>
                <Line
                  yAxisId="tasa"
                  type="monotone"
                  dataKey="tasa"
                  name="% de faltas"
                  stroke={tokenColor('chart-4')}
                  strokeWidth={2}
                  dot={{ r: 3, fill: tokenColor('chart-4') }}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </figure>

          {dias.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[20rem] border-separate border-spacing-1 text-center text-caption">
                <caption className="mb-1 text-left text-content-muted">% de faltas por día y franja (mañana = antes de las 13 h)</caption>
                <thead>
                  <tr>
                    <th scope="col" className="sr-only">Franja</th>
                    {dias.map((d) => (
                      <th key={d} scope="col" className="font-medium text-content-muted">
                        <abbr title={DAY_NAMES[d]} className="no-underline">{DAY_NAMES[d]?.slice(0, 3)}</abbr>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FRANJAS.map((franja) => (
                    <tr key={franja}>
                      <th scope="row" className="pr-1 text-left font-medium capitalize text-content-muted">{franja}</th>
                      {dias.map((d) => {
                        const s = cell(d, franja);
                        return (
                          <td
                            key={d}
                            data-testid={`franja-${d}-${franja}`}
                            title={s ? `${s.cancelados} de ${s.total} turnos · ${s.promedio} por día` : 'Sin turnos'}
                            className="rounded-control py-2 font-semibold text-content"
                            style={{ background: s ? tokenColor('chart-3', 0.08 + (s.tasa / maxTasa) * 0.4) : 'transparent' }}
                          >
                            {s ? pct(s.tasa) : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
