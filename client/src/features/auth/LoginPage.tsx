import { useId, useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Activity } from 'lucide-react';
import { Button } from '@/components/ui';
import { session } from '@/lib/session';
import { login } from './api';

const field =
  'h-11 w-full rounded-control border border-line-strong bg-surface px-3 text-body text-content placeholder:text-content-subtle focus-visible:shadow-focus focus-visible:outline-none';

export default function LoginPage() {
  const id = useId();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: ({ token, profesional }) => {
      session.save(token, profesional);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? '/dashboard', { replace: true });
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-surface-muted to-brand-100 px-gutter dark:from-brand-950 dark:via-surface-muted dark:to-surface">
      <div className="w-full max-w-sm rounded-card border border-line bg-surface-raised p-8 shadow-card">
        <div className="mb-6 flex items-center gap-3">
          <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-control bg-accent text-accent-fg">
            <Activity className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-title text-content">Synthetica Health</h1>
            <p className="text-caption text-content-muted">Ingresá a tu panel operativo</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor={`${id}-email`} className="mb-1 block text-caption font-medium text-content-muted">Email</label>
            <input
              id={`${id}-email`}
              type="email"
              autoComplete="email"
              required
              className={field}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={`${id}-password`} className="mb-1 block text-caption font-medium text-content-muted">Contraseña</label>
            <input
              id={`${id}-password`}
              type="password"
              autoComplete="current-password"
              required
              className={field}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {mutation.isError && (
            <p role="alert" className="text-caption text-status-cancelled">{mutation.error.message}</p>
          )}
          <Button type="submit" className="w-full" disabled={mutation.isPending || !email || !password}>
            {mutation.isPending ? 'Ingresando…' : 'Ingresar'}
          </Button>
        </form>
      </div>
    </main>
  );
}
