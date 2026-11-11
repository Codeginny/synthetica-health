import type { CSSProperties } from 'react';
import { cn } from './cn';
import styles from './Skeleton.module.scss';

export function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div aria-hidden="true" data-testid="skeleton" style={style} className={cn(styles.skeleton, className)} />;
}
