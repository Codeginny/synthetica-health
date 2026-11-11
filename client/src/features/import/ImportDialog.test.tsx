import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImportDialog } from './ImportDialog';
import { useDatasetStore } from '@/stores/datasetStore';
import { renderWithProviders } from '@/test/utils';

const csv = (content: string, name = 'turnos.csv') => {
  const file = new File([content], name, { type: 'text/csv' });
  // jsdom no implementa File.text()
  Object.defineProperty(file, 'text', { value: () => Promise.resolve(content) });
  return file;
};

describe('ImportDialog', () => {
  it('lee un CSV, muestra el resumen y aplica el dataset', async () => {
    const onImported = jest.fn();
    const onClose = jest.fn();
    renderWithProviders(<ImportDialog open onClose={onClose} onImported={onImported} />);

    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    await userEvent.upload(
      input,
      csv('profesional;fecha;hora;estado;especialidad\nDra. Paz;03/11/2026;09:00;atendido;Cardiología\nDr. Sosa;05/11/2026;10:00;ausente;Pediatría\nDr. Sosa;xx;10:00;ausente;Pediatría\n'),
    );

    expect(await screen.findByText(/turnos listos de/)).toHaveTextContent('2 turnos listos de 3 filas');
    expect(screen.getByText(/1 filas con problemas/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Ver mi dashboard/ }));
    expect(onImported).toHaveBeenCalledWith({ from: '2026-11-03', to: '2026-11-05' });
    expect(onClose).toHaveBeenCalled();
    expect(useDatasetStore.getState().dataset).toMatchObject({ fileName: 'turnos.csv', rows: expect.any(Array) });
  });

  it('avisa si faltan columnas obligatorias y no deja aplicar', async () => {
    renderWithProviders(<ImportDialog open onClose={jest.fn()} onImported={jest.fn()} />);
    await userEvent.upload(document.querySelector<HTMLInputElement>('input[type="file"]')!, csv('paciente,fecha\nAna,2026-11-01\n'));
    expect(await screen.findByRole('alert')).toHaveTextContent('profesional, estado');
    expect(screen.getByRole('button', { name: /Ver mi dashboard/ })).toBeDisabled();
  });

  it('rechaza formatos no soportados', async () => {
    renderWithProviders(<ImportDialog open onClose={jest.fn()} onImported={jest.fn()} />);
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    await userEvent.upload(input, new File(['x'], 'turnos.pdf', { type: 'application/pdf' }), { applyAccept: false });
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Formato no soportado'));
  });
});
