'use client';

import { BellRing, CalendarX, Clock, Sprout, type LucideIcon } from 'lucide-react';
import { Card, Skeleton } from '@/components/ui';
import type { DashboardData } from '@/types/analytics';
import { buildInsights, type InsightKind } from './insights';

const ICONS: Record<InsightKind, LucideIcon> = { franja: CalendarX, hora: Clock, ociosa: Sprout, recordatorios: BellRing };

export interface BusinessInsightsProps {
  data: DashboardData | undefined;
  loading?: boolean;
}

/** Responde "¿cómo gano más y reduzco el ausentismo?" con los números del período. */
export function BusinessInsights({ data, loading = false }: BusinessInsightsProps) {
  const insights = data ? buildInsights(data) : [];
  return (
    <Card title="Recomendaciones de negocio" description="Cómo ganar más y reducir el ausentismo, con los números de este período">
      {loading ? (
        <div className="grid gap-gutter md:grid-cols-2">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : insights.length === 0 ? (
        <p className="text-body text-content-muted">Todavía no hay suficientes turnos en el período para recomendar algo con datos.</p>
      ) : (
        <ul className="grid gap-gutter md:grid-cols-2">
          {insights.map((i) => {
            const Icon = ICONS[i.kind];
            return (
              <li key={i.kind} data-testid={`insight-${i.kind}`} className="flex flex-col gap-2 rounded-card border border-line bg-surface-muted p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 text-body font-semibold text-content">
                    <Icon aria-hidden="true" className="h-4 w-4 text-accent" /> {i.title}
                  </h3>
                  <span className="whitespace-nowrap rounded-control bg-accent/10 px-2 py-0.5 text-caption font-semibold text-accent">{i.metric}</span>
                </div>
                <p className="text-body text-content">{i.body}</p>
                <details className="text-caption text-content-muted">
                  <summary className="cursor-pointer font-medium text-accent focus-visible:shadow-focus focus-visible:outline-none">¿Cómo lo calculamos?</summary>
                  <p className="mt-1">{i.calculo}</p>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
