import axios, { isAxiosError, type AxiosRequestConfig } from 'axios';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Cliente del navegador: habla sólo con Next (BFF). La sesión viaja en cookie httpOnly. */
export const api = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' }, timeout: 30_000 });

api.interceptors.response.use(undefined, (err: unknown) => {
  if (isAxiosError(err) && err.response?.status === 401 && !err.config?.url?.includes('/session')) {
    window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
  }
  return Promise.reject(err);
});

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
