import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './http';

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        // Sin reintentos en 4xx: el error es determinista.
        retry: (count, err) => !(err instanceof ApiError && err.status !== null && err.status < 500) && count < 2,
      },
    },
  });
