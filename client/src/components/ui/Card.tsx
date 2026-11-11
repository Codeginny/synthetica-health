import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
  actions?: ReactNode;
}

export function Card({ title, description, actions, className, children, ...rest }: CardProps) {
  const headingId = title ? `card-${title.replace(/\s+/g, '-').toLowerCase()}` : undefined;
  return (
    <section
      aria-labelledby={headingId}
      className={cn('rounded-card border border-line bg-surface-raised p-section shadow-card', className)}
      {...rest}
    >
      {(title || actions) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && <h2 id={headingId} className="text-title text-content">{title}</h2>}
            {description && <p className="text-caption text-content-muted">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}
