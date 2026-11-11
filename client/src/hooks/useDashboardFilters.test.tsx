import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { defaultFilters, parseFilters, useDashboardFilters } from './useDashboardFilters';

const NOW = new Date('2026-11-10T12:00:00Z');

describe('parseFilters', () => {
  it('usa últimos 30 días por defecto', () => {
    expect(parseFilters(new URLSearchParams(), NOW)).toEqual({ from: '2026-10-12', to: '2026-11-10', doctor: null, status: null });
  });

  it('lee filtros válidos de la URL', () => {
    const p = new URLSearchParams('from=2026-11-01&to=2026-11-07&doctor=Dra.%20A&status=cancelado');
    expect(parseFilters(p, NOW)).toEqual({ from: '2026-11-01', to: '2026-11-07', doctor: 'Dra. A', status: 'cancelado' });
  });

  it('descarta fechas y estados inválidos', () => {
    const p = new URLSearchParams('from=ayer&to=2026-11-07&status=borrado');
    expect(parseFilters(p, NOW)).toEqual({ ...defaultFilters(NOW), status: null });
  });
});

describe('useDashboardFilters', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={['/dashboard?from=2026-11-01&to=2026-11-07']}>{children}</MemoryRouter>
  );

  it('aplica patches parciales y resetea', () => {
    const { result } = renderHook(() => useDashboardFilters(), { wrapper });
    act(() => result.current.update({ status: 'pendiente' }));
    expect(result.current.filters).toMatchObject({ from: '2026-11-01', to: '2026-11-07', status: 'pendiente' });

    act(() => result.current.update({ status: null, doctor: 'Dr. B' }));
    expect(result.current.filters).toMatchObject({ status: null, doctor: 'Dr. B' });

    act(() => result.current.reset());
    expect(result.current.filters.doctor).toBeNull();
    expect(result.current.filters.from).not.toBe('2026-11-01');
  });
});
