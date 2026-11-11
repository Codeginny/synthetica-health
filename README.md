# Synthetica Health

SaaS B2B de inteligencia operativa para clínicas: dashboard de agenda y ausentismo, design system documentado y asistente analítico en lenguaje natural.

| Problema | Solución | Impacto objetivo |
|---|---|---|
| Hasta 35% de ingresos perdidos por ausentismo y saturación operativa | Dashboard BI en tiempo real + asistente analítico en lenguaje natural | −30% tiempo administrativo · +22% recuperación de pacientes |

## Stack

React 18 · Vite 5 · TypeScript strict · Tailwind (tokens CSS, claro/oscuro) · TanStack Query 5 · Recharts · Vitest + Testing Library · Playwright · Storybook 8 (+a11y) · Node/Express · PostgreSQL (Supabase).

## Estructura

```
client/src
├─ components/ui/        Design system tipado (+ .stories.tsx, .test.tsx)
├─ features/
│  ├─ auth/              Login, RequireAuth
│  ├─ dashboard/         Página, queries (TanStack), api, agregación pura
│  └─ assistant/         Panel lateral del asistente analítico
├─ hooks/                useDashboardFilters (estado en URL)
├─ lib/                  http (axios + ApiError), session, theme, queryClient
├─ mocks/                Dataset determinista (demo, Storybook, E2E)
└─ types/analytics.ts    Contratos compartidos con la API
client/e2e/              Playwright
server/
├─ routes/               auth · analytics · ai
├─ services/             analyticsService (SQL), assistantService (asistente analítico)
└─ validators/           Zod
```

## Contratos API

Todas bajo `/api`, JSON. Rutas de datos requieren `Authorization: Bearer <jwt>`.

| Método | Ruta | Entrada | Salida |
|---|---|---|---|
| POST | `/login` | `{ email, password }` | `{ token, profesional }` |
| GET | `/analytics/dashboard` | `from`, `to` (YYYY-MM-DD), `doctor?`, `status?` | `DashboardData` |
| GET | `/analytics/doctors` | — | `string[]` |
| POST | `/assistant/query` | `{ question, filters }` | `AssistantAnswer` |

Tipos en `client/src/types/analytics.ts`. Errores: `{ error, details? }` con 400/401/422/429/5xx.

## Decisiones clave

- **Filtros en la URL** → compartibles, sobreviven reload, `queryKey` estable. Rango inválido se muestra y deshabilita la query (no se corrige en silencio).
- **TanStack Query**: `keepPreviousData` evita parpadeo al filtrar; sin reintentos en 4xx; `AbortSignal` propagado a axios.
- **Tokens como variables CSS RGB** (`rgb(var(--x) / α)`): un solo set de clases (`bg-surface`, `text-content`, `bg-accent`) para ambos temas; Recharts consume los mismos tokens en runtime. Paleta púrpura/violeta/lila/morado, sin azules. Contraste AA verificado en ambos temas.
- **Agregación pura** (`aggregate.ts`) espejo del SQL: alimenta demo, Storybook y E2E con el mismo dataset determinista.
- **Asistente analítico**: loop de tool use (`get_dashboard_metrics`, `strict`) + salida estructurada (`output_config.format` JSON Schema). El modelo nunca inventa cifras: toda métrica sale de la misma consulta SQL del dashboard. System prompt estable + `cache_control` para cachear el prefijo; fallback server-side ante rechazos.
- **SQL parametrizado** y validación Zod en el borde.
- Ausentismo = cancelados / total del rango.

## Scripts

```bash
# client
npm run dev            # modo demo: datos y asistente simulados, sin backend ni claves
npm run dev:api        # contra la API real (server en :3001)
npm run typecheck
npm test               # Vitest
npm run test:e2e       # Playwright (levanta Vite y mockea la API)
npm run storybook
npm run build          # build demo (deploy estático)
npm run build:api      # build contra la API real

# server
npm run dev
```

## Variables

`server/.env`: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_ORIGIN`, `PORT` y la clave del asistente. Ver `server/.env.example`.
