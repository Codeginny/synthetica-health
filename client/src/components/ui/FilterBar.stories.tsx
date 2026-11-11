import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';
import { fn } from '@storybook/test';
import { FilterBar, type FilterBarProps } from './FilterBar';
import { MOCK_DOCTORS } from '@/mocks/dashboard';

const meta = {
  title: 'Dashboard/FilterBar',
  component: FilterBar,
  args: {
    value: { from: '2026-10-12', to: '2026-11-10', doctor: null, status: null },
    doctors: MOCK_DOCTORS,
    disabled: false,
    onChange: fn(),
    onReset: fn(),
  },
  // Controlado: refleja los cambios en `args.value` para poder interactuar en el canvas.
  render: function Render(args: FilterBarProps) {
    const [, update] = useArgs<FilterBarProps>();
    return (
      <FilterBar
        {...args}
        onChange={(patch) => {
          args.onChange(patch);
          update({ value: { ...args.value, ...patch } });
        }}
      />
    );
  },
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const ConFiltros: Story = { args: { value: { from: '2026-11-01', to: '2026-11-10', doctor: 'Dra. Lucía Paz', status: 'cancelado' } } };
export const RangoInvalido: Story = { args: { value: { from: '2026-11-10', to: '2026-11-01', doctor: null, status: null } } };
export const Disabled: Story = { args: { disabled: true } };
