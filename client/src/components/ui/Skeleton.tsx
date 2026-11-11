import type { CSSProperties } from 'react';
import { cn } from './cn';

export function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      data-testid="skeleton"
      style={style}
      className={cn('animate-pulse rounded-control bg-brand-100 dark:bg-brand-900/40', className)}
    />
  );
}
