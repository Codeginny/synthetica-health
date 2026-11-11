import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/lib/theme';
import { setTestUrl } from './next-navigation';

export function renderWithProviders(ui: ReactElement, { route = '/' }: { route?: string } = {}) {
  setTestUrl(route);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <ThemeProvider initial="light">{children}</ThemeProvider>
    </QueryClientProvider>
  );
  return { client, ...render(ui, { wrapper: Wrapper }) };
}
