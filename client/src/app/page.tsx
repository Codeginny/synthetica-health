import type { Metadata } from 'next';
import LandingPage from '@/features/landing/LandingPage';

export const metadata: Metadata = {
  title: { absolute: 'Synthetica Health · Inteligencia operativa para clínicas' },
};

export default function Home() {
  return <LandingPage />;
}
