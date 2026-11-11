import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { session } from '@/lib/session';

export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (!session.token) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <>{children}</>;
}
