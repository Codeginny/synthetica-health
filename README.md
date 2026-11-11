# Synthetica Health — Frontend SSR con React, Next.js y TypeScript

**Dashboard SaaS B2B de inteligencia operativa para clínicas** · React 18 · Next.js 14 (SSR, App Router) · TypeScript estricto · Tailwind CSS · SCSS · TanStack Query (React Query) · Zustand · GraphQL · APIs REST · Recharts · Jest · React Testing Library · Playwright · Storybook · Design System · Accesibilidad WCAG 2.1 AA · Node.js · Express · PostgreSQL (Supabase)

![Dashboard en modo oscuro con anotaciones](docs/case/case-02-dashboard-oscuro.png)

| Problema | Solución | Impacto objetivo |
|---|---|---|
| Las clínicas medianas pierden hasta un **35%** de sus ingresos por ausentismo y mala asignación de turnos | Dashboard en tiempo real, renderizado en servidor, con filtros avanzados, design system propio y asistente analítico en lenguaje natural | **−30%** tiempo administrativo · **+22%** recuperación de pacientes |

### 👉 [Ver la demo online](https://client-five-weld-55.vercel.app) · usuario `demo@synthetica.health` / `demo1234`

---

## ¿Qué es y para quién es?

Synthetica Health **no es una herramienta para cargar turnos**: es un tablero para **quien gestiona la clínica**.

| Quién | Para qué la usa |
|---|---|
| **Dirección** | Ver dónde se pierden ingresos por ausentismo y decidir con datos, no con intuición. |
| **Administración** | Controlar facturación estimada, turnos pendientes y rendimiento por profesional sin armar planillas. |
| **Recepción** | Detectar franjas y especialidades con más cancelaciones para reforzar recordatorios y reasignar turnos. |
| **Profesionales** | Consultar su propia agenda y sus números del período (filtro por profesional). |

![Página de inicio](docs/case/case-10-inicio.png)

## ¿Cómo funciona en una clínica real?

1. **Los turnos se registran solos.** Cada vez que un paciente reserva, o recepción confirma, cancela o marca un turno como atendido, el sistema de turnos de la clínica (por ejemplo, [TurnosAR](https://github.com/Codeginny/SaaS-TurnosAR)) lo guarda en la base de datos (tabla `turnos` en PostgreSQL / Supabase). Nadie carga datos a mano.
2. **Synthetica los convierte en indicadores.** Lee esos turnos y calcula en tiempo real ausentismo, turnos completados, facturación estimada y cancelaciones por especialidad y profesional, con filtros por fechas, profesional y estado.
3. **La clínica decide y pregunta.** La dirección ve dónde actuar y puede preguntar en lenguaje natural: *“¿Cuál es la especialidad con más cancelaciones este mes?”*.

![Cómo funciona](docs/case/case-11-como-funciona.png)

## ¿Cómo la pruebo?

1. Entrá a la **[demo online](https://client-five-weld-55.vercel.app)** con `demo@synthetica.health` / `demo1234` (ya vienen completos).
2. Explorá con los **datos de ejemplo**: cambiá fechas, profesional y estado; probá el modo oscuro y el asistente.
3. Probá con **tus propios datos**: tocá **“Importar Excel/CSV”**, descargá la plantilla y subí tus turnos. El archivo se lee en tu navegador: **no se sube a ningún servidor**.

### Columnas del Excel o CSV

| Columna | Ejemplo | ¿Obligatoria? |
|---|---|---|
| `profesional` | Dra. Lucía Paz | Sí |
| `fecha` | `05/11/2026` o `2026-11-05` (también fecha nativa de Excel) | Sí |
| `estado` | `pendiente` · `confirmado` · `completado` · `cancelado` (acepta “atendido” y “ausente”) | Sí |
| `hora` | `09:30` | No |
| `especialidad` | Cardiología | No |
| `paciente` | Sofía Gómez | No |

Los encabezados pueden ir con o sin acentos (`Médico` también vale como `profesional`). Las filas inválidas se informan con su número y no se importan. Límite: 5 MB / 20.000 turnos. Plantilla: [`client/public/plantilla-turnos.csv`](client/public/plantilla-turnos.csv).

![Importar Excel o CSV](docs/case/case-12-importar.png)

![Dashboard con datos importados](docs/case/case-13-dashboard-importado.png)

> **Con datos reales:** en la versión conectada (`SYNTHETICA_DEMO=false`) los datos salen de la tabla `turnos` de Supabase. Para cargar un histórico, en Supabase: *Table editor → turnos → Insert → Import data from CSV* con las mismas columnas (`paciente_nombre`, `profesional`, `especialidad`, `fecha`, `hora`, `estado`, `precio_consulta`, `tipo_cobertura`).

---

## Requisitos del puesto → dónde está cada uno

| Requisito | Implementación | Evidencia |
|---|---|---|
| **React en producción** | React 18 con componentes funcionales, hooks y composición | `client/src/features`, `client/src/components/ui` |
| **SSR (Server-Side Rendering)** | Next.js 14 App Router: `/dashboard` es un Server Component que precarga datos e hidrata TanStack Query | `client/src/app/dashboard/page.tsx` · test E2E "SSR: el HTML inicial ya trae los KPIs" |
| **TypeScript** | `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`; contratos compartidos con la API | `client/tsconfig.json`, `client/src/types/analytics.ts` |
| **HTML5 / CSS3 / SCSS** | HTML semántico (`main`, `section`, `table` con `caption` y `scope`), variables CSS, SCSS Modules con mixins y `@use` | `client/src/index.css`, `client/src/styles/_mixins.scss`, `Skeleton.module.scss` |
| **Tailwind CSS** | Design tokens propios (colores, tipografía, espaciado, radios, sombras) mapeados a Tailwind | `client/tailwind.config.js` |
| **APIs REST** | API Express (auth, analytics, asistente) + BFF REST en Next | `server/routes`, `client/src/app/api/bff` |
| **GraphQL** | Endpoint `/api/graphql` con schema tipado, enums, inputs y validación; el dashboard consulta por GraphQL | `client/src/server/graphql`, `client/src/features/dashboard/api.ts` |
| **React Query (TanStack Query)** | Caché, `keepPreviousData`, skeletons, reintentos selectivos, hidratación SSR | `client/src/features/dashboard/queries.ts` |
| **Zustand** | Estado de UI del asistente con persistencia en `sessionStorage` | `client/src/stores/assistantStore.ts` |
| **Dashboards / visualización de datos** | KPIs, gráfico de áreas y de barras con Recharts, tabla de turnos | `client/src/components/ui/TrendChart.tsx`, `SpecialtyChart.tsx` |
| **Design system / Figma a código** | Tokens + componentes tipados documentados en Storybook | `client/src/components/ui`, `client/.storybook` |
| **Storybook** | 6 componentes con historias, controles interactivos (args), modo claro/oscuro y addon de accesibilidad | `*.stories.tsx` |
| **Jest + React Testing Library** | 49 tests unitarios y de integración | `*.test.ts(x)`, `client/jest.config.mjs` |
| **Playwright (E2E)** | Login → filtro por fechas → datos actualizados; SSR; cookie httpOnly; rango inválido; importación de CSV; página de inicio | `client/e2e` |
| **Accesibilidad (WCAG)** | ARIA, navegación completa por teclado, foco visible, contraste AA medido en ambos temas, `prefers-reduced-motion` | capturas 08 y 10 |
| **Modo claro / oscuro** | Tokens CSS por tema, sin flash al cargar | `client/src/lib/theme.tsx` |
| **Seguridad** | JWT en cookie `httpOnly`, BFF, validación Zod, SQL parametrizado, protección de rutas, sin open redirect | `client/src/app/api/session`, `server/` |
| **Importación de datos** | Excel (.xlsx) y CSV leídos en el navegador, validación por fila, sinónimos y formatos de fecha argentinos | `client/src/features/import` |
| **Ownership** | Producto definido, diseñado, desarrollado, testeado y documentado de punta a punta | este repositorio |

---

## Capturas

### Plataforma

**Un solo set de design tokens para modo claro y oscuro** — contraste WCAG AA en ambos
![Modo claro y oscuro](docs/case/case-09-paleta-claro-oscuro.png)

| Login | Mobile (modo oscuro) |
|---|---|
| ![Login](docs/screenshots/09-login-claro.png) | ![Mobile oscuro](docs/screenshots/10-mobile-oscuro.png) |

### Detalle con zoom

**KPIs con estados de carga y formato compacto** — React Query + skeletons SCSS
![KPIs](docs/case/case-06-kpi-desborde.png)

**Filtros avanzados por rango de fechas, profesional y estado** — sincronizados con la URL y leídos por el servidor (SSR)
![Filtros](docs/case/case-08-filtros-url.png)

**Visualización de datos con Recharts** — colores tomados de los design tokens
![Gráficos](docs/screenshots/05-zoom-graficos-oscuro.png)

**Tabla accesible** — `caption`, `scope`, región desplazable con foco
![Tabla](docs/screenshots/06-zoom-tabla-claro.png)

**Asistente analítico** — respuestas estructuradas (resumen, indicadores y tabla), historial con Zustand
![Asistente](docs/screenshots/07-zoom-asistente-oscuro.png)

**Accesibilidad** — foco visible por teclado y error de validación anunciado con `role="alert"`
![Accesibilidad](docs/case/case-07-accesibilidad.png)

### Calidad y documentación

**Storybook** — componentes con controles interactivos y addon de accesibilidad
![Storybook](docs/case/case-04-storybook.png)

**Playwright** — flujos críticos E2E
![Playwright](docs/screenshots/12-playwright-e2e.png)

**Test E2E del flujo crítico**: login → filtro por rango de fechas → KPIs, gráficos y tabla actualizados (también tras recargar)
![Test E2E](docs/case/case-05-playwright-e2e.png)

**Jest + React Testing Library** — cobertura
![Cobertura](docs/screenshots/13-jest-cobertura.png)

### Código

**TanStack Query + filtros sincronizados con la URL**
![TanStack Query](docs/case/case-03-react-query-filtros.png)

| SSR con Next.js | GraphQL |
|---|---|
| ![SSR](docs/screenshots/14-codigo-ssr-nextjs.png) | ![GraphQL](docs/screenshots/15-codigo-graphql.png) |
| **Test E2E del SSR** | **Zustand** |
| ![Test E2E](docs/screenshots/16-codigo-test-e2e.png) | ![Zustand](docs/screenshots/17-codigo-zustand.png) |

---

## Arquitectura

![Estructura del proyecto](docs/case/case-01-estructura.png)

<details>
<summary>Árbol completo</summary>

```
client/src
├─ app/                  Next.js App Router: /login, /dashboard (Server Component), api/session, api/bff, api/graphql
├─ server/               Sólo servidor: config, acceso a la API, schema y resolvers GraphQL
├─ middleware.ts         Protege /dashboard por cookie de sesión
├─ components/ui/        Design system tipado (+ .stories.tsx, .test.tsx, .module.scss)
├─ features/
│  ├─ landing/           Página de inicio: qué es, para quién, cómo funciona
│  ├─ import/            Importador Excel/CSV (normalización y validación)
│  ├─ auth/              Login / logout
│  ├─ dashboard/         Página, queries (TanStack), api (GraphQL), agregación pura
│  └─ assistant/         Panel lateral del asistente analítico
├─ stores/               Zustand
├─ hooks/                useDashboardFilters (estado en URL)
├─ lib/                  http, graphql, filters, theme, queryClient
├─ styles/               Mixins SCSS
├─ mocks/                Dataset determinista (modo demo, Storybook, tests)
└─ types/                Contratos compartidos con la API
client/e2e/              Playwright
server/                  API Express: routes · services · validators (Zod)
```

</details>

### Flujo SSR

```
Navegador ──▶ middleware (cookie?) ──▶ /dashboard (Server Component)
                                         ├─ parseFilters(searchParams)
                                         ├─ prefetch TanStack Query ─▶ server/backend ─▶ API Express / modo demo
                                         └─ HydrationBoundary ─▶ HTML con KPIs ya renderizados
Filtros (cliente) ──▶ history.replaceState ──▶ useQuery ──▶ /api/graphql ──▶ API (JWT desde cookie httpOnly)
```

### Decisiones clave

- **SSR con prefetch hidratado**: el primer paint ya trae datos reales; los skeletons quedan sólo para cambios de filtro.
- **BFF**: el navegador nunca ve el JWT (cookie `httpOnly`, `sameSite=lax`, `secure` en producción).
- **Estado de servidor vs. estado de UI**: TanStack Query para métricas; Zustand para la conversación del asistente; la URL para los filtros.
- **GraphQL para lectura, REST para comandos**: el dashboard pide exactamente los campos que renderiza; el asistente es una operación.
- **Design tokens como variables CSS RGB**: un solo set de clases para ambos temas; Recharts y SCSS consumen los mismos tokens. Paleta púrpura, violeta, lila y morado.
- **Agregación pura** (`aggregate.ts`) espejo del SQL: alimenta el modo demo, Storybook y los tests con el mismo dataset.
- Ausentismo = turnos cancelados / total del rango.

### Contratos API

| Capa | Método | Ruta | Entrada | Salida |
|---|---|---|---|---|
| Next | POST/DELETE | `/api/session` | `{ email, password }` | cookie httpOnly |
| Next | POST | `/api/graphql` | `query Dashboard($filters)` / `query Doctors` | `DashboardData` / `string[]` |
| Next | GET/POST | `/api/bff/*` | REST | proxy a la API Express |
| Express | POST | `/api/login` | `{ email, password }` | `{ token, profesional }` |
| Express | GET | `/api/analytics/dashboard` | `from`, `to`, `doctor?`, `status?` | `DashboardData` |
| Express | POST | `/api/assistant/query` | `{ question, filters }` | `AssistantAnswer` |

---

## Scripts

```bash
# client
npm run dev            # modo demo (por defecto): demo@synthetica.health / demo1234
npm run dev:api        # contra la API real (server en :3001)
npm run typecheck
npm test               # Jest + React Testing Library
npm run test:coverage
npm run test:e2e       # Playwright (levanta Next en modo demo)
npm run storybook
npm run build && npm start

# server
npm run dev
```

**Cobertura**: Jest mide componentes, hooks, stores, GraphQL y librerías; las rutas de Next, el middleware y la capa de sesión se cubren con Playwright.

### Variables

- `client/.env`: `SYNTHETICA_DEMO` (`true` por defecto), `SYNTHETICA_API_URL`.
- `server/.env`: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_ORIGIN`, `PORT` y la clave del asistente. Ver `server/.env.example`.

---

## Versión 2.0 — Próximas funcionalidades

**Producto**
- [ ] Alertas automáticas de pacientes en riesgo de ausentarse (recordatorios por WhatsApp y email).
- [ ] Analítica predictiva de ausentismo por franja horaria, especialidad y profesional.
- [ ] Reasignación sugerida de turnos libres para recuperar capacidad ociosa.
- [ ] Multi-sede y roles (dirección, recepción, profesional) con permisos por vista.
- [ ] Exportación de reportes a PDF y Excel desde el dashboard.
- [ ] Mapa de calor de ocupación por día y hora.

**Frontend**
- [ ] Streaming SSR con `Suspense` por sección y React Server Components para tablas grandes.
- [ ] Tabla virtualizada con paginación del lado del servidor, ordenamiento y columnas configurables.
- [ ] Internacionalización (es / pt / en) y formato regional de moneda y fechas.
- [ ] PWA con modo offline para recepción.
- [ ] Biblioteca de componentes publicada como paquete (npm) con versionado semántico.

**Calidad y plataforma**
- [ ] Pruebas de regresión visual (Chromatic / Playwright snapshots) y auditoría a11y automatizada en CI.
- [ ] CI/CD con GitHub Actions: typecheck, Jest, Playwright y build en cada PR.
- [ ] Deploy en Azure Static Web Apps y monitoreo con Application Insights.
- [ ] Métricas de Web Vitals (LCP, INP, CLS) y presupuestos de performance.
- [ ] GraphQL con subscriptions para actualizar el dashboard en tiempo real.

---

**Autoría:** Virginia Alejandra Ponce
