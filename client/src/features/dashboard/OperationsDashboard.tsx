'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarCheck, CalendarClock, CircleDollarSign, LogOut, UserX } from 'lucide-react';
import {
  AppointmentsTable,
  ErrorState,
  FilterBar,
  MetricCard,
  SpecialtyChart,
  TrendChart,
} from '@/components/ui';
import { AssistantPanel } from '@/features/assistant/AssistantPanel';
import { useDashboardFilters } from '@/hooks/useDashboardFilters';
import { formatCurrency } from '@/lib/dates';
import { Button } from '@/components/ui';
import { logout } from '@/features/auth/api';
import { ImportDialog } from '@/features/import/ImportDialog';
import { DataSourceBanner } from '@/features/import/DataSourceBanner';
import { useDatasetStore } from '@/stores/datasetStore';
import { ThemeToggle } from './ThemeToggle';
import { useDashboardData, useDoctors } from './queries';

export default function OperationsDashboard() {
  const { filters, update, reset } = useDashboardFilters();
  const { data, isPending, isFetching, isError, error, refetch } = useDashboardData(filters);
  const doctors = useDoctors();
  const loading = isPending;
  const kpis = data?.kpis;
  const router = useRouter();
  const [importOpen, setImportOpen] = useState(false);
  const clearDataset = useDatasetStore((s) => s.clear);
  const closeImport = useCallback(() => setImportOpen(false), []);

  // El dataset importado vive en sessionStorage: se rehidrata sólo en el cliente (sin mismatch de SSR).
  useEffect(() => {
    void useDatasetStore.persist.rehydrate();
  }, []);

  const resetToDemo = () => {
    clearDataset();
    reset();
  };

  const onLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-surface-muted font-sans text-content">
      <main className="mx-auto max-w-7xl space-y-section px-gutter py-8" aria-busy={isFetching}>
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-caption font-semibold uppercase tracking-widest text-accent">Synthetica Health</p>
            <h1 className="text-display text-content">Inteligencia operativa</h1>
            <p className="text-body text-content-muted">Agenda, ausentismo y rendimiento de la clínica en tiempo real.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="inline-flex h-8 items-center rounded-control px-3 text-caption font-medium text-content-muted hover:bg-surface-muted hover:text-content focus-visible:shadow-focus focus-visible:outline-none">
              ¿Cómo funciona?
            </Link>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => void onLogout()}>
              <LogOut aria-hidden="true" className="h-4 w-4" /> Salir
            </Button>
          </div>
        </header>

        <DataSourceBanner onImport={() => setImportOpen(true)} onReset={resetToDemo} />

        <FilterBar value={filters} doctors={doctors.data ?? []} onChange={update} onReset={reset} />

        {isError ? (
          <ErrorState message={`No se pudieron cargar las métricas: ${error.message}`} onRetry={() => void refetch()} />
        ) : (
          <>
            <section aria-label="Indicadores clave" className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Turnos" value={kpis?.total ?? 0} icon={<CalendarClock className="h-5 w-5" />} loading={loading} />
              <MetricCard
                label="Completados"
                value={kpis?.completados ?? 0}
                hint={`${kpis?.pendientes ?? 0} pendientes`}
                icon={<CalendarCheck className="h-5 w-5" />}
                loading={loading}
              />
              <MetricCard
                label="Ausentismo"
                value={`${kpis?.tasaAusentismo ?? 0}%`}
                hint={`${kpis?.cancelados ?? 0} cancelados`}
                tone="danger"
                icon={<UserX className="h-5 w-5" />}
                loading={loading}
              />
              <MetricCard
                label="Ingresos estimados"
                value={formatCurrency(kpis?.ingresos ?? 0, true)}
                hint="Confirmados + completados"
                tone="neutral"
                icon={<CircleDollarSign className="h-5 w-5" />}
                loading={loading}
              />
            </section>

            <div className="grid gap-gutter lg:grid-cols-2">
              <TrendChart data={data?.serie ?? []} loading={loading} />
              <SpecialtyChart data={data?.porEspecialidad ?? []} loading={loading} />
            </div>

            <AppointmentsTable rows={data?.turnos ?? []} loading={loading} />
          </>
        )}
      </main>
      <AssistantPanel filters={filters} />
      <ImportDialog
        open={importOpen}
        onClose={closeImport}
        onImported={(range) => update({ from: range.from, to: range.to, doctor: null, status: null })}
      />
    </div>
  );
}
