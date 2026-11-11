import type { AppointmentStatus } from '@/types/analytics';
import { cn } from './cn';

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  completado: 'Completado',
  cancelado: 'Cancelado',
};

const styles: Record<AppointmentStatus, string> = {
  pendiente: 'bg-status-pending/15 text-brand-800 dark:text-brand-200',
  confirmado: 'bg-status-confirmed/15 text-brand-800 dark:text-brand-200',
  completado: 'bg-status-completed/15 text-brand-900 dark:text-brand-100',
  cancelado: 'bg-status-cancelled/15 text-status-cancelled',
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-caption font-medium', styles[status])}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status]}
    </span>
  );
}
