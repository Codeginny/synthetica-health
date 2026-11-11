import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './http';

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Con SSR, evita refetch inmediato de lo que ya vino hidratado.
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        retry: (count, err) => !(err instanceof ApiError && err.status !== null && err.status < 500) && count < 2,
      },
    },
  });
