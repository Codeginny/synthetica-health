import { expect, test, type Page } from '@playwright/test';
import { buildDashboard } from '../src/features/dashboard/aggregate';
import { generateAppointments, MOCK_DOCTORS } from '../src/mocks/dashboard';
import type { DashboardFilters } from '../src/types/analytics';

const ROWS = generateAppointments(new Date());

/** Backend falso: aplica los mismos filtros que la API real sobre un dataset determinista. */
async function mockApi(page: Page) {
  const requests: URL[] = [];

  await page.route('**/api/login', async (route) => {
    const { email, password } = route.request().postDataJSON() as { email: string; password: string };
    if (password !== 'demo1234') return route.fulfill({ status: 401, json: { error: 'Credenciales inválidas' } });
    return route.fulfill({ json: { token: 'e2e-token', profesional: { id: 1, nombre: 'Dra. Demo', email, especialidad: 'Clínica' } } });
  });

  await page.route('**/api/analytics/doctors', (route) => route.fulfill({ json: MOCK_DOCTORS }));

  await page.route('**/api/analytics/dashboard?*', async (route) => {
    const url = new URL(route.request().url());
    expect(route.request().headers()['authorization']).toBe('Bearer e2e-token');
    requests.push(url);
    const q = url.searchParams;
    const filters: DashboardFilters = {
      from: q.get('from')!,
      to: q.get('to')!,
      doctor: q.get('doctor'),
      status: q.get('status') as DashboardFilters['status'],
    };
    await route.fulfill({ json: buildDashboard(ROWS, filters) });
  });

  return requests;
}

const isoDaysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

test('login → filtro por rango de fechas → KPIs, gráficos y tabla se actualizan', async ({ page }) => {
  const requests = await mockApi(page);

  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel('Email').fill('demo@synthetica.health');
  await page.getByLabel('Contraseña').fill('demo1234');
  await page.getByRole('button', { name: 'Ingresar' }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('heading', { name: 'Inteligencia operativa' })).toBeVisible();

  const totalMetric = page.getByTestId('metric-Turnos');
  const initial = buildDashboard(ROWS, { from: isoDaysAgo(29), to: isoDaysAgo(0), doctor: null, status: null });
  await expect(totalMetric).toHaveText(String(initial.kpis.total));

  // Acotar a los últimos 7 días.
  const from = isoDaysAgo(6);
  await page.getByLabel('Desde').fill(from);

  const expected = buildDashboard(ROWS, { from, to: isoDaysAgo(0), doctor: null, status: null });
  expect(expected.kpis.total).toBeLessThan(initial.kpis.total);

  await expect(totalMetric).toHaveText(String(expected.kpis.total));
  await expect(page).toHaveURL(new RegExp(`from=${from}`));
  await expect(page.getByText(`${expected.turnos.length} resultados`)).toBeVisible();
  expect(requests.at(-1)?.searchParams.get('from')).toBe(from);

  // La tabla refleja el nuevo dataset (header + hasta 15 filas visibles).
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(1 + Math.min(15, expected.turnos.length));

  // El filtro sobrevive a un reload (estado en la URL).
  await page.reload();
  await expect(page.getByLabel('Desde')).toHaveValue(from);
  await expect(totalMetric).toHaveText(String(expected.kpis.total));
});

test('credenciales inválidas muestran error accesible', async ({ page }) => {
  await mockApi(page);
  await page.goto('/login');
  await page.getByLabel('Email').fill('demo@synthetica.health');
  await page.getByLabel('Contraseña').fill('incorrecta');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByRole('alert')).toHaveText('Credenciales inválidas');
});

test('rango inválido bloquea la consulta y lo informa', async ({ page }) => {
  const requests = await mockApi(page);
  await page.addInitScript(() => localStorage.setItem('synthetica.token', 'e2e-token'));
  await page.goto(`/dashboard?from=${isoDaysAgo(0)}&to=${isoDaysAgo(5)}`);
  await expect(page.getByRole('alert')).toContainText('anterior o igual');
  expect(requests).toHaveLength(0);
});
