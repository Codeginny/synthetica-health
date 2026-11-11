import { expect, test, type Page } from '@playwright/test';
import { buildDashboard } from '../src/features/dashboard/aggregate';
import { generateAppointments } from '../src/mocks/dashboard';

// Mismo dataset determinista que sirve el BFF en modo demo.
const ROWS = generateAppointments(new Date());
const DEMO = { email: 'demo@synthetica.health', password: 'demo1234' };

const isoDaysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

async function login(page: Page) {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
  await page.waitForLoadState('networkidle'); // hidratado: el submit lo maneja React
  await page.getByLabel('Email').fill(DEMO.email);
  await page.getByLabel('Contraseña').fill(DEMO.password);
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await page.waitForLoadState('networkidle'); // dashboard hidratado antes de interactuar
}

test('login → filtro por rango de fechas → KPIs, gráficos y tabla se actualizan', async ({ page }) => {
  await login(page);
  await expect(page.getByRole('heading', { name: 'Inteligencia operativa' })).toBeVisible();

  const totalMetric = page.getByTestId('metric-Turnos');
  const initial = buildDashboard(ROWS, { from: isoDaysAgo(29), to: isoDaysAgo(0), doctor: null, status: null });
  await expect(totalMetric).toHaveText(String(initial.kpis.total));

  const from = isoDaysAgo(6);
  const gqlCall = page.waitForResponse(
    (r) => r.url().endsWith('/api/graphql') && (r.request().postData() ?? '').includes(`"from":"${from}"`),
  );
  await page.getByLabel('Desde').fill(from);
  expect((await gqlCall).status()).toBe(200);

  const expected = buildDashboard(ROWS, { from, to: isoDaysAgo(0), doctor: null, status: null });
  expect(expected.kpis.total).toBeLessThan(initial.kpis.total);
  await expect(totalMetric).toHaveText(String(expected.kpis.total));
  await expect(page).toHaveURL(new RegExp(`from=${from}`));
  await expect(page.getByText(`${expected.turnos.length} resultados`)).toBeVisible();
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(1 + Math.min(15, expected.turnos.length));

  // El filtro sobrevive a un reload y se resuelve en el servidor (estado en la URL).
  await page.reload();
  await expect(page.getByLabel('Desde')).toHaveValue(from);
  await expect(totalMetric).toHaveText(String(expected.kpis.total));
});

test('SSR: el HTML inicial ya trae los KPIs (sin skeletons)', async ({ page }) => {
  await login(page);
  const from = isoDaysAgo(13);
  const expected = buildDashboard(ROWS, { from, to: isoDaysAgo(0), doctor: null, status: 'cancelado' });

  // Request directo con la cookie de sesión: es el HTML que devuelve el servidor, sin ejecutar JS.
  const res = await page.request.get(`/dashboard?from=${from}&to=${isoDaysAgo(0)}&status=cancelado`);
  const html = await res.text();
  expect(res.status()).toBe(200);
  expect(html).toContain(`data-testid="metric-Turnos">${expected.kpis.total}<`);
  expect(html).not.toContain('data-testid="skeleton"');
});

test('credenciales inválidas muestran error accesible', async ({ page }) => {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.getByLabel('Contraseña').fill('incorrecta');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Credenciales' })).toHaveText('Credenciales inválidas');
});

test('la cookie de sesión es httpOnly y BFF REST/GraphQL rechazan sin sesión', async ({ page, context }) => {
  await login(page);
  const cookie = (await context.cookies()).find((c) => c.name === 'synthetica_session');
  expect(cookie?.httpOnly).toBe(true);
  expect(await page.evaluate(() => document.cookie)).not.toContain('synthetica_session');

  await context.clearCookies();
  expect((await page.request.get(`/api/bff/analytics/doctors`)).status()).toBe(401);
  expect((await page.request.post(`/api/graphql`, { data: { query: '{ doctors }' } })).status()).toBe(401);
});

test('rango inválido no consulta y lo informa', async ({ page }) => {
  await login(page);
  const calls: string[] = [];
  page.on('request', (r) => r.url().endsWith('/api/graphql') && (r.postData() ?? '').includes('query Dashboard') && calls.push(r.url()));
  await page.goto(`/dashboard?from=${isoDaysAgo(0)}&to=${isoDaysAgo(5)}`);
  await expect(page.getByRole('alert').filter({ hasText: 'anterior o igual' })).toBeVisible();
  expect(calls).toHaveLength(0);
});
