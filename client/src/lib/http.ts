import axios, { isAxiosError, type AxiosRequestConfig } from 'axios';
import { session } from './session';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

api.interceptors.request.use((config) => {
  const token = session.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(undefined, (err: unknown) => {
  // Token vencido fuera del login: se descarta la sesión y se vuelve al login.
  if (isAxiosError(err) && err.response?.status === 401 && !err.config?.url?.includes('/login')) {
    session.clear();
    window.location.assign('/login');
  }
  return Promise.reject(err);
});

/** Normaliza errores de axios a `ApiError` para que la UI no dependa del transporte. */
export function toApiError(err: unknown): ApiError {
  if (isAxiosError<{ error?: string }>(err)) {
    const status = err.response?.status ?? null;
    const message = err.response?.data?.error ?? (status === null ? 'Sin conexión con el servidor' : `Error ${status}`);
    return new ApiError(message, status);
  }
  return new ApiError(err instanceof Error ? err.message : 'Error desconocido', null);
}

const config = (params?: Record<string, string>, signal?: AbortSignal): AxiosRequestConfig => ({
  ...(params ? { params } : {}),
  ...(signal ? { signal } : {}),
});

export async function getJson<T>(url: string, params?: Record<string, string>, signal?: AbortSignal): Promise<T> {
  try {
    return (await api.get<T>(url, config(params, signal))).data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function postJson<T>(url: string, body: unknown, signal?: AbortSignal): Promise<T> {
  try {
    return (await api.post<T>(url, body, config(undefined, signal))).data;
  } catch (err) {
    throw toApiError(err);
  }
}
