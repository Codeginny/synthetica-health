// Genera las capturas anotadas de "Recomendaciones de negocio" y "Horarios críticos" para el README y el portfolio.
// Uso: con `next start` (modo demo) en BASE_URL, `node scripts/capturas-recomendaciones.mjs <carpeta-salida>`.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://localhost:4175';
const OUT = process.argv[2] ?? '../docs/case';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function dashboard(colorScheme) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2, colorScheme });
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle');
  await page.getByLabel('Email').fill('demo@synthetica.health');
  await page.getByLabel('Contraseña').fill('demo1234');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await page.waitForURL(/dashboard/);
  await page.waitForLoadState('networkidle');
  if (colorScheme === 'dark' && (await page.getByRole('button', { name: 'Modo oscuro' }).getAttribute('aria-pressed')) !== 'true') {
    await page.getByRole('button', { name: 'Modo oscuro' }).click();
  }
  // El botón flotante del asistente tapa contenido en capturas recortadas.
  await page.getByRole('button', { name: /Asistente analítico/ }).evaluate((el) => (el.style.display = 'none'));
  return page;
}

/**
 * Captura `clip` y la monta en un lienzo con bordes redondeados, sombra violeta,
 * etiquetas numeradas tipo píldora y flechas curvas hacia cada punto.
 */
async function annotate(page, clip, labels, file) {
  const png = await page.screenshot({ clip });
  const pad = 260;
  const W = clip.width + pad * 2;
  const H = clip.height + 120;
  const canvas = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  const pts = labels.map((l, i) => {
    const left = l.side === 'left';
    const lx = left ? 24 : W - 24 - 220;
    const ly = Math.min(H - 70, Math.max(30, 60 + l.y - clip.y - 26));
    const tx = pad + l.x - clip.x;
    const ty = 60 + l.y - clip.y;
    const sx = left ? lx + 220 : lx;
    const sy = ly + 26;
    const cx = (sx + tx) / 2;
    return { ...l, n: i + 1, lx, ly, sx, sy, tx, ty, cx, cy: Math.min(sy, ty) - 40 };
  });
  await canvas.setContent(`<!doctype html><html><head><style>
    body{margin:0;width:${W}px;height:${H}px;background:radial-gradient(circle at 30% 20%,#3b1d6e,#140a26 70%);font-family:Inter,system-ui,sans-serif;position:relative;overflow:hidden}
    img{position:absolute;left:${pad}px;top:60px;width:${clip.width}px;border-radius:22px;box-shadow:0 24px 60px rgb(124 58 237 / .45),0 0 0 1px rgb(196 181 253 / .35)}
    .tag{position:absolute;width:220px;box-sizing:border-box;display:flex;align-items:center;gap:10px;padding:10px 16px;border-radius:999px;background:#7c3aed;color:#fff;font-weight:700;font-size:17px;border:3px solid #e9d5ff;box-shadow:0 8px 20px rgb(0 0 0 / .35)}
    .n{flex:none;width:28px;height:28px;border-radius:50%;background:#fff;color:#6d28d9;display:grid;place-items:center;font-size:15px}
    svg{position:absolute;inset:0}
  </style></head><body>
    <img src="data:image/png;base64,${png.toString('base64')}" />
    <svg width="${W}" height="${H}"><defs><marker id="a" markerWidth="12" markerHeight="12" refX="9" refY="6" orient="auto"><path d="M0,0 L12,6 L0,12 z" fill="#f0abfc"/></marker></defs>
      ${pts.map((p) => `<path d="M${p.sx},${p.sy} Q${p.cx},${p.cy} ${p.tx},${p.ty}" stroke="#f0abfc" stroke-width="3.5" fill="none" marker-end="url(#a)"/><circle cx="${p.tx}" cy="${p.ty}" r="16" stroke="#f0abfc" stroke-width="3" fill="none"/>`).join('')}
    </svg>
    ${pts.map((p) => `<div class="tag" style="left:${p.lx}px;top:${p.ly}px"><span class="n">${p.n}</span>${p.text}</div>`).join('')}
  </body></html>`);
  await canvas.screenshot({ path: join(OUT, file) });
  await canvas.close();
}

const box = async (locator) => {
  await locator.scrollIntoViewIfNeeded();
  const b = await locator.boundingBox();
  if (!b) throw new Error('Elemento sin caja');
  return b;
};
const centerLeft = (b) => ({ x: b.x - 6, y: b.y + b.height / 2 });

// 1) Recomendaciones (oscuro), con un "¿Cómo lo calculamos?" abierto.
{
  const page = await dashboard('dark');
  const panel = page.getByRole('region', { name: 'Recomendaciones de negocio' });
  await panel.getByTestId('insight-recordatorios').getByText('¿Cómo lo calculamos?').click();
  await page.evaluate(() => window.scrollTo(0, 0));
  const clip = await box(panel);
  const metric = async (kind) => {
    // Se apunta al borde derecho de la tarjeta, a la altura del dato, para no tapar texto.
    const card = await box(panel.getByTestId(`insight-${kind}`));
    const b = await box(panel.getByTestId(`insight-${kind}`).locator('span').last());
    return { x: card.x + card.width + 6, y: b.y + b.height / 2 };
  };
  const calc = await box(panel.getByTestId('insight-recordatorios').locator('details p'));
  await annotate(
    page,
    clip,
    [
      { side: 'left', text: 'Franja crítica', ...centerLeft(await box(panel.getByTestId('insight-franja'))) },
      { side: 'right', text: 'Hora crítica', ...(await metric('hora')) },
      { side: 'left', text: 'Hueco en agenda', ...centerLeft(await box(panel.getByTestId('insight-ociosa'))) },
      { side: 'right', text: 'Ingreso extra', ...(await metric('recordatorios')) },
      { side: 'right', text: 'Supuesto visible', x: calc.x + calc.width + 24, y: calc.y + calc.height / 2 },
    ],
    'case-14-recomendaciones.png',
  );
  await page.close();
}

// 2) Horarios críticos + facturación perdida (claro).
{
  const page = await dashboard('light');
  const hours = page.getByRole('region', { name: 'Horarios críticos de ausentismo' });
  const lost = page.getByRole('region', { name: 'Facturación perdida por especialidad' });
  const a = await box(hours);
  const b = await box(lost);
  const clip = { x: a.x, y: a.y, width: b.x + b.width - a.x, height: Math.max(a.height, b.height) };
  const bar = await box(hours.locator('.recharts-bar-rectangle').first());
  const dot = await box(hours.locator('.recharts-line-dot').first());
  const grid = await box(hours.getByTestId('franja-1-mañana'));
  const lostBar = await box(lost.locator('.recharts-bar-rectangle').first());
  await annotate(
    page,
    clip,
    [
      { side: 'left', text: 'Hora crítica', x: bar.x + bar.width / 2, y: bar.y + bar.height * 0.6 },
      { side: 'left', text: '% de faltas', x: dot.x + dot.width / 2, y: dot.y + dot.height / 2 },
      { side: 'left', text: 'Día × franja', ...centerLeft(grid) },
      { side: 'right', text: 'Pérdida en $', x: lostBar.x + lostBar.width - 20, y: lostBar.y + lostBar.height / 2 },
    ],
    'case-15-horarios-perdida.png',
  );
  await page.close();
}

await browser.close();
