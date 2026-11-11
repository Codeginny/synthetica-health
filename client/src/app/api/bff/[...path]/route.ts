import { NextResponse, type NextRequest } from 'next/server';
import { backend, BackendError, sessionToken } from '@/server/backend';
import { parseFilters } from '@/lib/filters';
import { isValidRange } from '@/lib/dates';
import type { DashboardFilters } from '@/types/analytics';

type Ctx = { params: { path: string[] } };

const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

async function handle(run: () => Promise<unknown>) {
  if (!sessionToken()) return fail(401, 'Sesión expirada');
  try {
    return NextResponse.json(await run());
  } catch (err) {
    if (err instanceof BackendError) return fail(err.status, err.message);
    console.error(err);
    return fail(502, 'Servicio no disponible');
  }
}

/** BFF: el navegador sólo habla con Next; Next agrega el JWT de la cookie hacia la API. */
export async function GET(req: NextRequest, { params }: Ctx) {
  switch (params.path.join('/')) {
    case 'analytics/dashboard': {
      const filters = parseFilters(req.nextUrl.searchParams);
      if (!isValidRange(filters.from, filters.to)) return fail(400, 'Rango de fechas inválido');
      return handle(() => backend.dashboard(filters));
    }
    case 'analytics/doctors':
      return handle(() => backend.doctors());
    default:
      return fail(404, 'Ruta no encontrada');
  }
}

export async function POST(req: NextRequest, { params }: Ctx) {
  if (params.path.join('/') !== 'assistant/query') return fail(404, 'Ruta no encontrada');
  const body = (await req.json().catch(() => ({}))) as { question?: unknown; filters?: DashboardFilters };
  if (typeof body.question !== 'string' || !body.filters) return fail(400, 'Datos inválidos');
  const question = body.question.trim().slice(0, 500);
  const filters = body.filters;
  return handle(() => backend.ask(question, filters));
}
