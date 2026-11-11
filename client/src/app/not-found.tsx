import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-display text-content">Página no encontrada</h1>
      <Link href="/dashboard" className="text-accent underline">Volver al dashboard</Link>
    </main>
  );
}
