'use client';

import { useId } from 'react';
import { RotateCcw } from 'lucide-react';
import { APPOINTMENT_STATUSES, type AppointmentStatus, type DashboardFilters } from '@/types/analytics';
import { isValidRange } from '@/lib/dates';
import { Button } from './Button';
import { STATUS_LABEL } from './StatusBadge';

export interface FilterBarProps {
  value: DashboardFilters;
  doctors: string[];
  onChange: (patch: Partial<DashboardFilters>) => void;
  onReset?: () => void;
  disabled?: boolean;
}

const field =
  'h-10 w-full rounded-control border border-line-strong bg-surface px-3 text-body text-content focus-visible:shadow-focus focus-visible:outline-none';

export function FilterBar({ value, doctors, onChange, onReset, disabled = false }: FilterBarProps) {
  const id = useId();
  const rangeError = !isValidRange(value.from, value.to);

  return (
    <form
      role="search"
      aria-label="Filtros del dashboard"
      onSubmit={(e) => e.preventDefault()}
      className="grid gap-gutter rounded-card border border-line bg-surface-raised p-gutter shadow-card sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.3fr_1fr_auto] lg:items-end"
    >
      <div>
        <label htmlFor={`${id}-from`} className="mb-1 block text-caption font-medium text-content-muted">Desde</label>
        <input
          id={`${id}-from`}
          type="date"
          className={field}
          value={value.from}
          max={value.to}
          disabled={disabled}
          aria-invalid={rangeError}
          aria-describedby={rangeError ? `${id}-range-err` : undefined}
          onChange={(e) => onChange({ from: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor={`${id}-to`} className="mb-1 block text-caption font-medium text-content-muted">Hasta</label>
        <input
          id={`${id}-to`}
          type="date"
          className={field}
          value={value.to}
          min={value.from}
          disabled={disabled}
          aria-invalid={rangeError}
          onChange={(e) => onChange({ to: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor={`${id}-doctor`} className="mb-1 block text-caption font-medium text-content-muted">Profesional</label>
        <select
          id={`${id}-doctor`}
          className={field}
          value={value.doctor ?? ''}
          disabled={disabled}
          onChange={(e) => onChange({ doctor: e.target.value || null })}
        >
          <option value="">Todos</option>
          {doctors.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor={`${id}-status`} className="mb-1 block text-caption font-medium text-content-muted">Estado</label>
        <select
          id={`${id}-status`}
          className={field}
          value={value.status ?? ''}
          disabled={disabled}
          onChange={(e) => onChange({ status: (e.target.value || null) as AppointmentStatus | null })}
        >
          <option value="">Todos</option>
          {APPOINTMENT_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
      </div>
      {onReset && (
        <Button variant="ghost" onClick={onReset} disabled={disabled} aria-label="Restablecer filtros">
          <RotateCcw aria-hidden="true" className="h-4 w-4" /> Limpiar
        </Button>
      )}
      {rangeError && (
        <p id={`${id}-range-err`} role="alert" className="text-caption text-status-cancelled sm:col-span-2 lg:col-span-5">
          La fecha “Desde” debe ser anterior o igual a “Hasta”.
        </p>
      )}
    </form>
  );
}
