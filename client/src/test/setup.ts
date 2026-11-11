import '@testing-library/jest-dom';
import { setTestUrl } from './next-navigation';

// Sólo en tests de navegador (jsdom); los de servidor usan @jest-environment node.
if (typeof window !== 'undefined') {
  // Next 14 sincroniza history.replaceState con useSearchParams; se emula igual.
  const nativeReplace = window.history.replaceState.bind(window.history);
  window.history.replaceState = (data: unknown, unused: string, href?: string | URL | null) => {
    nativeReplace(data, unused, href);
    if (typeof href === 'string') setTestUrl(href);
  };

  // Recharts/ResponsiveContainer requiere ResizeObserver en jsdom.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

// Stores de Zustand limpios entre tests.
import { resetAssistantStore } from '@/stores/assistantStore';
import { resetDatasetStore } from '@/stores/datasetStore';
afterEach(() => {
  resetAssistantStore();
  resetDatasetStore();
  if (typeof sessionStorage !== 'undefined') sessionStorage.clear();
});
