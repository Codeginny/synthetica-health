import { useSyncExternalStore } from 'react';

/** Reemplazo de `next/navigation` en Jest (vía moduleNameMapper): URL en memoria y reactiva. */
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
  replace: jest.fn((href: string) => setTestUrl(href)),
  push: jest.fn((href: string) => setTestUrl(href)),
  refresh: jest.fn(),
};

export const useRouter = () => routerMock;
export const usePathname = () => useSyncExternalStore(subscribe, () => url.pathname);
export function useSearchParams() {
  const search = useSyncExternalStore(subscribe, () => url.search);
  return new URLSearchParams(search);
}
