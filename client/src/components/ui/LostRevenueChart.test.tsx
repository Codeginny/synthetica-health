import { render, screen } from '@testing-library/react';
import { formatCurrency } from '@/lib/dates';
import { LostRevenueChart } from './LostRevenueChart';

describe('LostRevenueChart', () => {
  it('ordena por pérdida y totaliza en pesos', () => {
    render(
      <LostRevenueChart
        data={[
          { especialidad: 'Pediatría', total: 10, cancelados: 2, perdida: 56000 },
          { especialidad: 'Cardiología', total: 10, cancelados: 3, perdida: 135000 },
        ]}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Facturación perdida por especialidad' })).toBeInTheDocument();
    expect(screen.getByText(/en el período/).textContent).toContain(`${formatCurrency(191000)} en el período`);
    expect(screen.getByRole('img')).toHaveAccessibleName(/Mayor pérdida: Cardiología/);
  });

  it('sin faltas muestra estado vacío', () => {
    render(<LostRevenueChart data={[{ especialidad: 'Pediatría', total: 10, cancelados: 0, perdida: 0 }]} />);
    expect(screen.getByText(/no hay facturación perdida/)).toBeInTheDocument();
  });
});
