import { postJson } from '@/lib/http';
import type { SessionUser } from '@/lib/session';

export interface LoginResponse {
  token: string;
  profesional: SessionUser;
}

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export const login = (email: string, password: string): Promise<LoginResponse> => {
  // Modo demo: cualquier credencial entra, sin backend.
  if (USE_MOCKS) {
    return Promise.resolve({ token: 'demo', profesional: { id: 0, nombre: 'Usuario demo', email, especialidad: 'Clínica' } });
  }
  return postJson<LoginResponse>('/login', { email, password });
};
