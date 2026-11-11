import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AssistantPanel } from './AssistantPanel';
import { dashboardApi } from '@/features/dashboard/api';
import { mockAssistant } from '@/mocks/dashboard';
import { ApiError } from '@/lib/http';
import { renderWithProviders } from '@/test/utils';
import type { DashboardFilters } from '@/types/analytics';

const filters: DashboardFilters = { from: '2026-11-01', to: '2026-11-10', doctor: null, status: null };

describe('AssistantPanel', () => {
  afterEach(() => jest.restoreAllMocks());

  it('abre como diálogo, enfoca el input y Escape devuelve el foco', async () => {
    renderWithProviders(<AssistantPanel filters={filters} />);
    const trigger = screen.getByRole('button', { name: 'Asistente analítico' });

    await userEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Asistente analítico' })).toBeInTheDocument();
    expect(screen.getByLabelText('Pregunta para el asistente')).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('envía la pregunta con los filtros activos y muestra la respuesta estructurada', async () => {
    const spy = jest.spyOn(dashboardApi, 'askAssistant').mockResolvedValue(mockAssistant(filters));
    renderWithProviders(<AssistantPanel filters={filters} defaultOpen />);

    await userEvent.type(screen.getByLabelText('Pregunta para el asistente'), '¿Cómo viene el ausentismo?{Enter}');

    expect(spy).toHaveBeenCalledWith('¿Cómo viene el ausentismo?', filters);
    expect(await screen.findByText(/concentra más cancelaciones/)).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByLabelText('Pregunta para el asistente')).toHaveValue('');
  });

  it('muestra el error y permite reintentar', async () => {
    jest.spyOn(dashboardApi, 'askAssistant').mockRejectedValue(new ApiError('El asistente está saturado', 429));
    renderWithProviders(<AssistantPanel filters={filters} defaultOpen />);

    await userEvent.click(screen.getByRole('button', { name: /especialidad con más cancelaciones/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('El asistente está saturado');
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });
});
