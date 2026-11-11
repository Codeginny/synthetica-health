import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './LoginPage';
import * as authApi from './api';
import { ApiError } from '@/lib/http';
import { hardNavigate } from '@/lib/browser';
import { renderWithProviders } from '@/test/utils';

jest.mock('./api');
jest.mock('@/lib/browser');
const login = jest.mocked(authApi.login);

describe('LoginPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('en modo demo precarga las credenciales y las muestra', () => {
    renderWithProviders(<LoginPage next="/dashboard" demo={{ email: 'demo@x.com', password: 'pw' }} />);
    expect(screen.getByLabelText('Email')).toHaveValue('demo@x.com');
    expect(screen.getByText(/Modo demo/)).toHaveTextContent('demo@x.com');
  });

  it('login exitoso redirige al destino pedido', async () => {
    login.mockResolvedValue({ nombre: 'Ana' });
    renderWithProviders(<LoginPage next="/dashboard?from=2026-11-01&to=2026-11-07" demo={null} />);

    await userEvent.type(screen.getByLabelText('Email'), 'ana@clinica.com');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secreta');
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(login).toHaveBeenCalledWith('ana@clinica.com', 'secreta');
    expect(hardNavigate).toHaveBeenCalledWith('/dashboard?from=2026-11-01&to=2026-11-07');
  });

  it('credenciales inválidas muestran alerta y no redirigen', async () => {
    login.mockRejectedValue(new ApiError('Credenciales inválidas', 401));
    renderWithProviders(<LoginPage next="/dashboard" demo={null} />);

    await userEvent.type(screen.getByLabelText('Email'), 'ana@clinica.com');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'mal');
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales inválidas');
    expect(hardNavigate).not.toHaveBeenCalled();
  });

  it('el botón queda deshabilitado sin datos', () => {
    renderWithProviders(<LoginPage next="/dashboard" demo={null} />);
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeDisabled();
  });
});
