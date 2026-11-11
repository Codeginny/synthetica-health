import type { Decorator, Preview } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import '../src/index.css';

const withTheme: Decorator = (Story, ctx) => {
  const dark = ctx.globals['theme'] === 'dark';
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);
  return (
    <div className="min-h-screen bg-surface-muted p-6 font-sans text-content" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Story />
    </div>
  );
};

const withProviders: Decorator = (Story) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <Story />
  </QueryClientProvider>
);

const preview: Preview = {
  decorators: [withTheme, withProviders],
  globalTypes: {
    theme: {
      description: 'Tema',
      toolbar: { icon: 'mirror', items: [{ value: 'light', title: 'Claro' }, { value: 'dark', title: 'Oscuro' }], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: 'light' },
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
    a11y: { test: 'error' },
  },
  tags: ['autodocs'],
};

export default preview;
