import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from './FilterBar';
import type { DashboardFilters } from '@/types/analytics';

const value: DashboardFilters = { from: '2026-11-01', to: '2026-11-10', doctor: null, status: null };

describe('FilterBar', () => {
  it('emite patches por profesional y estado', async () => {
    const onChange = jest.fn();
    render(<FilterBar value={value} doctors={['Dra. A', 'Dr. B']} onChange={onChange} />);

    await userEvent.selectOptions(screen.getByLabelText('Profesional'), 'Dr. B');
    expect(onChange).toHaveBeenLastCalledWith({ doctor: 'Dr. B' });

    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'cancelado');
    expect(onChange).toHaveBeenLastCalledWith({ status: 'cancelado' });
  });

  it('"Todos" se traduce a null', async () => {
    const onChange = jest.fn();
    render(<FilterBar value={{ ...value, doctor: 'Dra. A' }} doctors={['Dra. A']} onChange={onChange} />);
    await userEvent.selectOptions(screen.getByLabelText('Profesional'), '');
    expect(onChange).toHaveBeenLastCalledWith({ doctor: null });
  });

  it('marca rango inválido de forma accesible', () => {
    render(<FilterBar value={{ ...value, from: '2026-11-20' }} doctors={[]} onChange={jest.fn()} />);
    expect(screen.getByRole('alert')).toHaveTextContent('anterior o igual');
    expect(screen.getByLabelText('Desde')).toHaveAttribute('aria-invalid', 'true');
  });

  it('reset es operable por teclado', async () => {
    const onReset = jest.fn();
    render(<FilterBar value={value} doctors={[]} onChange={jest.fn()} onReset={onReset} />);
    screen.getByRole('button', { name: 'Restablecer filtros' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
