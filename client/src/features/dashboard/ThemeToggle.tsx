'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui';
import { useTheme } from '@/lib/theme';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';
  return (
    <Button variant="secondary" size="sm" aria-pressed={dark} onClick={toggle}>
      {dark ? <Sun aria-hidden="true" className="h-4 w-4" /> : <Moon aria-hidden="true" className="h-4 w-4" />}
      Modo oscuro
    </Button>
  );
}
