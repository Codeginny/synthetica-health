import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AssistantAnswer } from '@/types/analytics';

export interface Exchange {
  id: number;
  question: string;
  answer: AssistantAnswer;
}

interface AssistantState {
  open: boolean;
  history: Exchange[];
  setOpen: (open: boolean) => void;
  addExchange: (question: string, answer: AssistantAnswer) => void;
  clear: () => void;
}

const MAX_HISTORY = 20;

/**
 * Estado de UI del asistente (Zustand): independiente del árbol de componentes y
 * persistido en sessionStorage → la conversación sobrevive a recargas y cambios de filtro.
 * El estado de servidor (métricas) sigue en TanStack Query.
 */
export const useAssistantStore = create<AssistantState>()(
  persist(
    (set) => ({
      open: false,
      history: [],
      setOpen: (open) => set({ open }),
      addExchange: (question, answer) =>
        set((s) => ({ history: [...s.history, { id: Date.now(), question, answer }].slice(-MAX_HISTORY) })),
      clear: () => set({ history: [] }),
    }),
    {
      name: 'synthetica.assistant',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({ history: s.history }),
      skipHydration: true,
    },
  ),
);

export const resetAssistantStore = () => useAssistantStore.setState({ open: false, history: [] });
