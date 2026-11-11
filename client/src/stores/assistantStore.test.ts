import { act } from '@testing-library/react';
import { useAssistantStore } from './assistantStore';
import { mockAssistant } from '@/mocks/dashboard';

const answer = mockAssistant({ from: '2026-11-01', to: '2026-11-10', doctor: null, status: null });

describe('assistantStore', () => {
  it('agrega intercambios y limita el historial a 20', () => {
    act(() => {
      for (let i = 0; i < 25; i++) useAssistantStore.getState().addExchange(`p${i}`, answer);
    });
    const { history } = useAssistantStore.getState();
    expect(history).toHaveLength(20);
    expect(history.at(-1)?.question).toBe('p24');
  });

  it('persiste sólo el historial en sessionStorage', () => {
    act(() => {
      useAssistantStore.getState().setOpen(true);
      useAssistantStore.getState().addExchange('hola', answer);
    });
    const saved = JSON.parse(sessionStorage.getItem('synthetica.assistant') ?? '{}') as { state: Record<string, unknown> };
    expect(Object.keys(saved.state)).toEqual(['history']);
  });

  it('clear vacía la conversación', () => {
    act(() => {
      useAssistantStore.getState().addExchange('hola', answer);
      useAssistantStore.getState().clear();
    });
    expect(useAssistantStore.getState().history).toEqual([]);
  });
});
