import type { Metadata } from 'next';
import LoginPage from '@/features/auth/LoginPage';
import { DEMO_CREDENTIALS, DEMO_MODE } from '@/server/config';

export const metadata: Metadata = { title: 'Ingresar' };

export default function Page({ searchParams }: { searchParams: { next?: string } }) {
  // Sólo rutas internas como destino post-login (evita open redirect).
  const next = searchParams.next?.startsWith('/') && !searchParams.next.startsWith('//') ? searchParams.next : '/dashboard';
  return <LoginPage next={next} demo={DEMO_MODE ? DEMO_CREDENTIALS : null} />;
}
