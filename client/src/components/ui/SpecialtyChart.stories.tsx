import type { Meta, StoryObj } from '@storybook/react';
import { SpecialtyChart } from './SpecialtyChart';

const meta = {
  title: 'Dashboard/SpecialtyChart',
  component: SpecialtyChart,
  args: {
    loading: false,
    height: 280,
    data: [
      { especialidad: 'Cardiología', total: 182, cancelados: 31, perdida: 1395000 },
      { especialidad: 'Pediatría', total: 164, cancelados: 22, perdida: 616000 },
      { especialidad: 'Dermatología', total: 120, cancelados: 27, perdida: 1026000 },
      { especialidad: 'Traumatología', total: 96, cancelados: 11, perdida: 462000 },
    ],
  },
  argTypes: { height: { control: { type: 'range', min: 160, max: 480, step: 20 } } },
} satisfies Meta<typeof SpecialtyChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Loading: Story = { args: { loading: true } };
export const Empty: Story = { args: { data: [] } };
