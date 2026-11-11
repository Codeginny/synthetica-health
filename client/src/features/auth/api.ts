import { api, postJson } from '@/lib/http';

export const login = (email: string, password: string) => postJson<{ nombre: string }>('/session', { email, password });
export const logout = () => api.delete('/session');
