import Link from 'next/link';
import {
  Activity,
  BarChart3,
  Building2,
  CalendarCheck,
  ClipboardList,
  FileSpreadsheet,
  LogIn,
  MessageSquareText,
  ShieldCheck,
  Stethoscope,
  UserCog,
} from 'lucide-react';
import { ThemeToggle } from '@/features/dashboard/ThemeToggle';

const AUDIENCE = [
  { icon: Building2, title: 'Dirección', text: 'Ve dónde se pierden ingresos por ausentismo y toma decisiones con datos, no con intuición.' },
  { icon: UserCog, title: 'Administración', text: 'Controla facturación estimada, turnos pendientes y rendimiento por profesional sin armar planillas.' },
  { icon: ClipboardList, title: 'Recepción', text: 'Detecta franjas y especialidades con más cancelaciones para reforzar recordatorios y reasignar turnos.' },
  { icon: Stethoscope, title: 'Profesionales', text: 'Consultan su propia agenda y sus números del período (filtro por profesional).' },
];

const STEPS = [
  {
    icon: CalendarCheck,
    title: 'Los turnos se registran solos',
    text: 'Cada vez que un paciente reserva, o recepción confirma, cancela o marca un turno como atendido, el sistema de turnos de la clínica (por ejemplo, TurnosAR) lo guarda en la base de datos. Nadie carga datos a mano.',
  },
  {
    icon: BarChart3,
    title: 'Synthetica los convierte en indicadores',
    text: 'Lee esos turnos y calcula en tiempo real ausentismo, turnos completados, facturación estimada y cancelaciones por especialidad y profesional, filtrando por fechas, profesional y estado.',
  },
  {
    icon: MessageSquareText,
    title: 'La clínica decide y pregunta',
    text: 'La dirección ve dónde actuar y puede preguntar en lenguaje natural, por ejemplo: “¿Cuál es la especialidad con más cancelaciones este mes?”.',
  },
];

const TRY = [
  { icon: LogIn, title: 'Entrá a la demo', text: 'Usuario demo@synthetica.health y contraseña demo1234 (ya vienen completos).' },
  { icon: Activity, title: 'Explorá con datos de ejemplo', text: 'Cambiá fechas, profesional y estado; probá el modo oscuro y el asistente analítico.' },
  { icon: FileSpreadsheet, title: 'Probá con tus propios datos', text: 'Tocá “Importar Excel/CSV”, descargá la plantilla y subí tus turnos. Se procesan sólo en tu navegador.' },
];

const COLUMNS = [
  ['profesional', 'Dra. Lucía Paz', 'Sí'],
  ['fecha', '05/11/2026 o 2026-11-05', 'Sí'],
  ['estado', 'pendiente · confirmado · completado · cancelado', 'Sí'],
  ['hora', '09:30', 'No'],
  ['especialidad', 'Cardiología', 'No'],
  ['paciente', 'Sofía Gómez', 'No'],
];

function Step({ n, icon: Icon, title, text }: { n: number; icon: typeof Activity; title: string; text: string }) {
  return (
    <li className="relative rounded-card border border-line bg-surface-raised p-section shadow-card">
      <span aria-hidden="true" className="absolute -top-3 left-section rounded-full bg-accent px-2.5 py-0.5 text-caption font-bold text-accent-fg">
        {n}
      </span>
      <Icon aria-hidden="true" className="mb-3 h-6 w-6 text-accent" />
      <h3 className="mb-1 text-body font-semibold text-content">{title}</h3>
      <p className="text-caption text-content-muted">{text}</p>
    </li>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-muted font-sans text-content">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-gutter py-5">
        <span className="flex items-center gap-2 font-semibold">
          <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-control bg-accent text-accent-fg">
            <Activity className="h-5 w-5" />
          </span>
          Synthetica Health
        </span>
        <nav aria-label="Principal" className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login" className="rounded-control bg-accent px-4 py-2 text-caption font-semibold text-accent-fg hover:bg-brand-800 focus-visible:shadow-focus focus-visible:outline-none dark:hover:bg-brand-300">
            Probar la demo
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl space-y-16 px-gutter pb-16">
        <section className="pt-8 text-center" aria-labelledby="hero">
          <p className="mb-3 text-caption font-semibold uppercase tracking-widest text-accent">Inteligencia operativa para clínicas</p>
          <h1 id="hero" className="mx-auto max-w-3xl text-display text-content sm:text-[2.75rem] sm:leading-tight">
            Entendé dónde tu clínica pierde tiempo y dinero por el ausentismo
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-body text-content-muted">
            Las clínicas medianas pierden hasta un 35% de sus ingresos mensuales por turnos a los que nadie asiste y agendas mal
            distribuidas. Synthetica Health convierte los turnos de la clínica en un tablero claro, en tiempo real, para decidir con datos.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/login" className="rounded-control bg-accent px-5 py-3 text-body font-semibold text-accent-fg shadow-card hover:bg-brand-800 focus-visible:shadow-focus focus-visible:outline-none dark:hover:bg-brand-300">
              Probar la demo
            </Link>
            <a href="#como-funciona" className="rounded-control border border-line-strong bg-surface px-5 py-3 text-body font-semibold text-content hover:bg-surface-raised focus-visible:shadow-focus focus-visible:outline-none">
              ¿Cómo funciona?
            </a>
          </div>
        </section>

        <section aria-labelledby="para-quien">
          <h2 id="para-quien" className="mb-2 text-title text-content">¿Para quién es?</h2>
          <p className="mb-6 max-w-3xl text-body text-content-muted">
            No es una herramienta para cargar turnos: es para <strong className="text-content">quien gestiona la clínica</strong>. Los
            profesionales también pueden ver su agenda, pero el foco está en la gestión.
          </p>
          <ul className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCE.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-card border border-line bg-surface-raised p-section shadow-card">
                <Icon aria-hidden="true" className="mb-3 h-6 w-6 text-accent" />
                <h3 className="mb-1 text-body font-semibold text-content">{title}</h3>
                <p className="text-caption text-content-muted">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="como-funciona" aria-labelledby="funciona" className="scroll-mt-8">
          <h2 id="funciona" className="mb-2 text-title text-content">¿Cómo funciona en una clínica real?</h2>
          <p className="mb-8 max-w-3xl text-body text-content-muted">
            Los datos no se cargan a mano: salen del sistema de turnos que la clínica ya usa.
          </p>
          <ol className="grid gap-gutter md:grid-cols-3">
            {STEPS.map((s, i) => <Step key={s.title} n={i + 1} {...s} />)}
          </ol>
        </section>

        <section aria-labelledby="probar" className="rounded-card border border-line bg-surface-raised p-section shadow-card sm:p-8">
          <h2 id="probar" className="mb-2 text-title text-content">¿Cómo la pruebo?</h2>
          <p className="mb-8 max-w-3xl text-body text-content-muted">
            La demo funciona sin base de datos: trae datos de ejemplo y te deja subir los tuyos.
          </p>
          <ol className="mb-8 grid gap-gutter md:grid-cols-3">
            {TRY.map((s, i) => <Step key={s.title} n={i + 1} {...s} />)}
          </ol>

          <h3 className="mb-2 text-body font-semibold text-content">Columnas del Excel o CSV</h3>
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Columnas del archivo">
            <table className="w-full min-w-[520px] text-left text-caption">
              <caption className="sr-only">Columnas aceptadas por el importador</caption>
              <thead className="text-content-muted">
                <tr>
                  <th scope="col" className="py-2 pr-4 font-medium">Columna</th>
                  <th scope="col" className="py-2 pr-4 font-medium">Ejemplo</th>
                  <th scope="col" className="py-2 font-medium">¿Obligatoria?</th>
                </tr>
              </thead>
              <tbody>
                {COLUMNS.map(([c, e, r]) => (
                  <tr key={c} className="border-t border-line">
                    <th scope="row" className="py-2 pr-4 font-mono font-medium text-content">{c}</th>
                    <td className="py-2 pr-4 text-content-muted">{e}</td>
                    <td className="py-2 text-content-muted">{r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 flex flex-wrap items-center gap-3 text-caption text-content-muted">
            <a href="/plantilla-turnos.csv" download className="font-semibold text-accent underline">Descargar plantilla</a>
            <span className="flex items-center gap-1.5">
              <ShieldCheck aria-hidden="true" className="h-4 w-4 text-accent" />
              El archivo se lee en tu navegador: no se sube a ningún servidor.
            </span>
          </p>
        </section>

        <section className="text-center" aria-labelledby="cta">
          <h2 id="cta" className="mb-4 text-title text-content">¿Lo vemos funcionando?</h2>
          <Link href="/login" className="inline-block rounded-control bg-accent px-6 py-3 text-body font-semibold text-accent-fg shadow-card hover:bg-brand-800 focus-visible:shadow-focus focus-visible:outline-none dark:hover:bg-brand-300">
            Probar la demo
          </Link>
        </section>
      </main>

      <footer className="border-t border-line py-6 text-center text-caption text-content-subtle">
        Synthetica Health · Proyecto de Virginia Alejandra Ponce ·{' '}
        <a href="https://github.com/Codeginny/synthetica-health" className="text-accent underline">Código en GitHub</a>
      </footer>
    </div>
  );
}
