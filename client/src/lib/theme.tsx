'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
export const THEME_STORAGE_KEY = 'synthetica.theme';

/** Script inline en <head>: aplica el tema antes del primer paint (sin flash en SSR). */
export const themeInitScript = `(()=>{try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';var r=document.documentElement;r.classList.toggle('dark',t==='dark');r.style.colorScheme=t}catch(e){}})()`;

export function ThemeProvider({ children, initial }: { children: ReactNode; initial?: Theme }) {
  // SSR y primer render cliente coinciden ('light'); luego se sincroniza con lo que aplicó el script.
  const [theme, setTheme] = useState<Theme>(initial ?? 'light');

  useEffect(() => {
    if (!initial && document.documentElement.classList.contains('dark')) setTheme('dark');
  }, [initial]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
  }, [theme]);

  const toggle = useCallback(
    () =>
      setTheme((t) => {
        const next = t === 'dark' ? 'light' : 'dark';
        try {
          localStorage.setItem(THEME_STORAGE_KEY, next);
        } catch {
          /* almacenamiento bloqueado: el tema vive sólo en la sesión */
        }
        return next;
      }),
    [],
  );
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme requiere <ThemeProvider>');
  return ctx;
}
