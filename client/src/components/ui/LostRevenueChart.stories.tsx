import type { Meta, StoryObj } from '@storybook/react';
import { LostRevenueChart } from './LostRevenueChart';

const meta = {
  title: 'Dashboard/LostRevenueChart',
  component: LostRevenueChart,
  args: {
    loading: false,
    height: 260,
    data: [
      { especialidad: 'Cardiología', total: 182, cancelados: 31, perdida: 1395000 },
      { especialidad: 'Pediatría', total: 164, cancelados: 22, perdida: 616000 },
      { especialidad: 'Dermatología', total: 120, cancelados: 27, perdida: 1026000 },
      { especialidad: 'Traumatología', total: 96, cancelados: 11, perdida: 462000 },
    ],
  },
  argTypes: { height: { control: { type: 'range', min: 160, max: 480, step: 20 } } },
} satisfies Meta<typeof LostRevenueChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const SinFaltas: Story = { args: { data: [{ especialidad: 'Pediatría', total: 40, cancelados: 0, perdida: 0 }] } };
export const Loading: Story = { args: { loading: true } };
