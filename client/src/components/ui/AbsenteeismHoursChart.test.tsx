import { render, screen, within } from '@testing-library/react';
import type { DayShiftPoint, HourPoint } from '@/types/analytics';
import { AbsenteeismHoursChart } from './AbsenteeismHoursChart';

const porHora: HourPoint[] = [
  { hora: 8, total: 20, cancelados: 8, tasa: 40 },
  { hora: 12, total: 20, cancelados: 2, tasa: 10 },
  { hora: 18, total: 10, cancelados: 0, tasa: 0 },
];
const porDiaFranja: DayShiftPoint[] = [
  { dia: 1, franja: 'mañana', total: 20, cancelados: 6, tasa: 30, promedio: 5 },
  { dia: 1, franja: 'tarde', total: 10, cancelados: 1, tasa: 10, promedio: 2.5 },
  { dia: 3, franja: 'mañana', total: 12, cancelados: 2, tasa: 16.7, promedio: 3 },
];

describe('AbsenteeismHoursChart', () => {
  it('anuncia las horas críticas y arma la grilla día × franja', () => {
    render(<AbsenteeismHoursChart porHora={porHora} porDiaFranja={porDiaFranja} promedio={20} />);
    expect(screen.getByRole('heading', { name: 'Horarios críticos de ausentismo' })).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAccessibleName(/Horas críticas: 8 h\. Promedio 20%/);

    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['Franja', 'Lun', 'Mié']);
    expect(screen.getByTestId('franja-1-mañana')).toHaveTextContent('30%');
    expect(screen.getByTestId('franja-3-tarde')).toHaveTextContent('—');
  });

  it('muestra estado vacío y skeleton', () => {
    const { rerender } = render(<AbsenteeismHoursChart porHora={[]} porDiaFranja={[]} promedio={0} />);
    expect(screen.getByText('Sin turnos para analizar horarios')).toBeInTheDocument();
    rerender(<AbsenteeismHoursChart porHora={porHora} porDiaFranja={porDiaFranja} promedio={20} loading />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
