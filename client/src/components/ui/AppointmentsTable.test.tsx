import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { AppointmentsTable } from './AppointmentsTable';
import { generateAppointments } from '@/mocks/dashboard';

const rows = generateAppointments(new Date('2026-11-10T12:00:00'), 3);

describe('AppointmentsTable', () => {
  it('renderiza filas hasta el límite con headers semánticos', () => {
    render(<AppointmentsTable rows={rows} limit={5} />);
    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('columnheader')).toHaveLength(6);
    expect(within(table).getAllByRole('row')).toHaveLength(1 + 5);
    expect(screen.getByText(`${rows.length} resultados`)).toBeInTheDocument();
  });

  it('muestra estado vacío', () => {
    render(<AppointmentsTable rows={[]} />);
    expect(screen.getByRole('status')).toHaveTextContent('No hay turnos');
  });
});
