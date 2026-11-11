import { AlertTriangle, Inbox } from 'lucide-react';
import { Button } from './Button';

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-10 text-center">
      <AlertTriangle aria-hidden="true" className="h-8 w-8 text-status-cancelled" />
      <p className="text-body text-content">{message}</p>
      {onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>Reintentar</Button>}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-2 py-10 text-center text-content-muted">
      <Inbox aria-hidden="true" className="h-8 w-8" />
      <p className="text-body">{message}</p>
    </div>
  );
}
