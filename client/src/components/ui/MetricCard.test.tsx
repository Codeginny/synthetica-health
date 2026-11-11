import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricCard } from './MetricCard';

describe('MetricCard', () => {
  it('muestra label, valor y hint', () => {
    render(<MetricCard label="Turnos" value={42} hint="3 pendientes" />);
    expect(screen.getByRole('heading', { name: 'Turnos' })).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('3 pendientes')).toBeInTheDocument();
  });

  it('en carga muestra skeleton y oculta el valor', () => {
    render(<MetricCard label="Turnos" value={42} loading />);
    expect(screen.getByRole('article')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    expect(screen.queryByText('42')).not.toBeInTheDocument();
  });
});
