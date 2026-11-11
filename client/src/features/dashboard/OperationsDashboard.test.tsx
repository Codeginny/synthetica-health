import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OperationsDashboard from './OperationsDashboard';
import { dashboardApi } from './api';
import { buildDashboard } from './aggregate';
import { generateAppointments, MOCK_DOCTORS } from '@/mocks/dashboard';
import { ApiError } from '@/lib/http';
import { renderWithProviders } from '@/test/utils';

const ROWS = generateAppointments(new Date('2026-11-10T12:00:00'));
const ROUTE = '/dashboard?from=2026-11-01&to=2026-11-10';

describe('OperationsDashboard', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(dashboardApi, 'getDoctors').mockResolvedValue(MOCK_DOCTORS);
  });

  it('muestra skeletons y luego KPIs', async () => {
    jest.spyOn(dashboardApi, 'getDashboard').mockImplementation(async (f) => buildDashboard(ROWS, f));
    renderWithProviders(<OperationsDashboard />, { route: ROUTE });

    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
    const expected = buildDashboard(ROWS, { from: '2026-11-01', to: '2026-11-10', doctor: null, status: null });
    expect(await screen.findByTestId('metric-Turnos')).toHaveTextContent(String(expected.kpis.total));
  });

  it('refetchea con el nuevo filtro', async () => {
    const spy = jest.spyOn(dashboardApi, 'getDashboard').mockImplementation(async (f) => buildDashboard(ROWS, f));
    renderWithProviders(<OperationsDashboard />, { route: ROUTE });
    await screen.findByTestId('metric-Turnos');

    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'cancelado');
    await waitFor(() => expect(spy).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'cancelado' }), expect.anything()));
    const expected = buildDashboard(ROWS, { from: '2026-11-01', to: '2026-11-10', doctor: null, status: 'cancelado' });
    await waitFor(() => expect(screen.getByTestId('metric-Turnos')).toHaveTextContent(String(expected.kpis.total)));
  });

  it('muestra error con reintento', async () => {
    const spy = jest.spyOn(dashboardApi, 'getDashboard').mockRejectedValueOnce(new ApiError('Error 500', 500));
    renderWithProviders(<OperationsDashboard />, { route: ROUTE });

    expect(await screen.findByRole('alert')).toHaveTextContent('Error 500');
    spy.mockImplementation(async (f) => buildDashboard(ROWS, f));
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByTestId('metric-Turnos')).toBeInTheDocument();
  });
});
