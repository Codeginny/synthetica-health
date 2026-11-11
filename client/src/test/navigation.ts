import { useSyncExternalStore } from 'react';
import { vi } from 'vitest';

/** Router en memoria que reemplaza `next/navigation` en tests (URL reactiva). */
let url = new URL('http://test/');
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function setTestUrl(path: string) {
  url = new URL(path, 'http://test');
  emit();
}

export const routerMock = {
  replace: vi.fn((href: string) => setTestUrl(href.startsWith('/') ? href : `${url.pathname}${href}`)),
  push: vi.fn((href: string) => setTestUrl(href)),
  refresh: vi.fn(),
};

// Next 14 sincroniza history.replaceState con useSearchParams; acá se emula igual.
const nativeReplace = window.history.replaceState.bind(window.history);
window.history.replaceState = (data, unused, href) => {
  nativeReplace(data, unused, href);
  if (typeof href === 'string') setTestUrl(href);
};

vi.mock('next/navigation', () => ({
  useRouter: () => routerMock,
  usePathname: () => useSyncExternalStore(subscribe, () => url.pathname),
  useSearchParams: () => {
    const search = useSyncExternalStore(subscribe, () => url.search);
    return new URLSearchParams(search);
  },
}));
