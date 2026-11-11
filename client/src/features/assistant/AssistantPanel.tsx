import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Send, Sparkles, X } from 'lucide-react';
import { Button, cn, ErrorState } from '@/components/ui';
import { useAssistantQuery } from '@/features/dashboard/queries';
import type { AssistantAnswer, DashboardFilters } from '@/types/analytics';

const SUGGESTIONS = [
  '¿Cuál es la especialidad con más cancelaciones este mes?',
  'Muéstrame las métricas de ausentismo de la semana pasada',
  '¿Qué profesional tiene más turnos pendientes?',
];

interface Exchange {
  id: number;
  question: string;
  answer: AssistantAnswer;
}

export interface AssistantPanelProps {
  filters: DashboardFilters;
  defaultOpen?: boolean;
}

export function AssistantPanel({ filters, defaultOpen = false }: AssistantPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<Exchange[]>([]);
  const mutation = useAssistantQuery(filters);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function ask(q: string) {
    const text = q.trim();
    if (!text || mutation.isPending) return;
    mutation.mutate(text, {
      onSuccess: (answer) => {
        setHistory((h) => [...h, { id: Date.now(), question: text, answer }]);
        setQuestion('');
      },
    });
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(question);
  };

  return (
    <>
      <Button
        ref={triggerRef}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn('fixed bottom-6 right-6 z-40 h-12 rounded-full px-5 shadow-card', open && 'hidden')}
      >
        <Sparkles aria-hidden="true" className="h-5 w-5" /> Asistente analítico
      </Button>

      {open && (
        <aside
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-panel flex-col border-l border-line bg-surface-raised shadow-card"
        >
          <header className="flex items-center justify-between border-b border-line p-gutter">
            <h2 id={titleId} className="flex items-center gap-2 text-title text-content">
              <Sparkles aria-hidden="true" className="h-5 w-5 text-accent" /> Asistente analítico
            </h2>
            <Button variant="ghost" size="sm" onClick={close} aria-label="Cerrar asistente">
              <X aria-hidden="true" className="h-4 w-4" />
            </Button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto p-gutter" aria-live="polite" aria-busy={mutation.isPending}>
            {history.length === 0 && (
              <div className="space-y-2">
                <p className="text-caption text-content-muted">
                  Pregunta en lenguaje natural. Se usan los filtros activos como contexto.
                </p>
                <ul className="space-y-2">
                  {SUGGESTIONS.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onClick={() => ask(s)}
                        className="w-full rounded-control border border-line bg-surface p-3 text-left text-caption text-content hover:border-brand-400 focus-visible:shadow-focus focus-visible:outline-none"
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {history.map((ex) => (
              <article key={ex.id} className="space-y-2">
                <p className="ml-8 rounded-control bg-accent px-3 py-2 text-caption text-accent-fg">{ex.question}</p>
                <AnswerView answer={ex.answer} />
              </article>
            ))}

            {mutation.isPending && <p className="animate-pulse text-caption text-content-muted">Analizando métricas…</p>}
            {mutation.isError && <ErrorState message={mutation.error.message} onRetry={() => ask(question)} />}
          </div>

          <form onSubmit={onSubmit} className="flex gap-2 border-t border-line p-gutter">
            <label htmlFor={`${titleId}-q`} className="sr-only">Pregunta para el asistente</label>
            <textarea
              id={`${titleId}-q`}
              ref={inputRef}
              rows={2}
              value={question}
              maxLength={500}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) onSubmit(e);
              }}
              placeholder="¿Cuál fue la tasa de ausentismo esta semana?"
              className="flex-1 resize-none rounded-control border border-line-strong bg-surface p-2 text-body text-content placeholder:text-content-subtle focus-visible:shadow-focus focus-visible:outline-none"
            />
            <Button type="submit" aria-label="Enviar pregunta" disabled={!question.trim() || mutation.isPending}>
              <Send aria-hidden="true" className="h-4 w-4" />
            </Button>
          </form>
        </aside>
      )}
    </>
  );
}

function AnswerView({ answer }: { answer: AssistantAnswer }) {
  return (
    <div className="space-y-3 rounded-control border border-line bg-surface p-3">
      <p className="text-body text-content">{answer.summary}</p>
      {answer.highlights.length > 0 && (
        <dl className="grid grid-cols-2 gap-2">
          {answer.highlights.map((h) => (
            <div key={h.label} className="rounded-control bg-surface-muted p-2">
              <dt className="text-caption text-content-muted">{h.label}</dt>
              <dd className="font-semibold text-content">{h.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {answer.table && (
        <div className="overflow-x-auto">
          <table className="w-full text-caption">
            <thead>
              <tr>
                {answer.table.columns.map((c) => (
                  <th key={c} scope="col" className="border-b border-line py-1 pr-2 text-left text-content-muted">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {answer.table.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => <td key={j} className="py-1 pr-2 text-content">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
