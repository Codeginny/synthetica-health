import type { ReactNode } from 'react';
import { Skeleton } from './Skeleton';
import { cn } from './cn';

export type MetricTone = 'brand' | 'neutral' | 'danger';

export interface MetricCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  tone?: MetricTone;
  loading?: boolean;
}

const toneStyles: Record<MetricTone, string> = {
  brand: 'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300',
  neutral: 'bg-surface-muted text-content-muted',
  danger: 'bg-status-cancelled/10 text-status-cancelled',
};

export function MetricCard({ label, value, hint, icon, tone = 'brand', loading = false }: MetricCardProps) {
  return (
    <article
      aria-busy={loading}
      className="flex min-w-0 items-center gap-4 rounded-card border border-line bg-surface-raised p-gutter shadow-card"
    >
      {icon && (
        <div aria-hidden="true" className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-control', toneStyles[tone])}>
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <h3 className="text-caption text-content-muted">{label}</h3>
        {loading ? (
          <Skeleton className="mt-1 h-8 w-20" />
        ) : (
          <p className="truncate text-metric tabular-nums text-content" title={String(value)} data-testid={`metric-${label}`}>{value}</p>
        )}
        {hint && !loading && <p className="text-caption text-content-subtle">{hint}</p>}
      </div>
    </article>
  );
}
