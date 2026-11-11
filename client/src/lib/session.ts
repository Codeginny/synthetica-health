export interface SessionUser {
  id: number;
  nombre: string;
  email: string;
  especialidad: string;
}

const TOKEN_KEY = 'synthetica.token';
const USER_KEY = 'synthetica.user';

export const session = {
  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  get user(): SessionUser | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  },
  save(token: string, user: SessionUser): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
