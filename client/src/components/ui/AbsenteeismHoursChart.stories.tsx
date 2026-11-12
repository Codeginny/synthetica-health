import type { Meta, StoryObj } from '@storybook/react';
import { mockDashboard } from '@/mocks/dashboard';
import { AbsenteeismHoursChart } from './AbsenteeismHoursChart';

const demo = mockDashboard({ from: '2026-10-12', to: '2026-11-10', doctor: null, status: null }, new Date('2026-11-10T12:00:00'));

const meta = {
  title: 'Dashboard/AbsenteeismHoursChart',
  component: AbsenteeismHoursChart,
  args: {
    loading: false,
    height: 260,
    porHora: demo.porHora,
    porDiaFranja: demo.porDiaFranja,
    promedio: demo.kpis.tasaAusentismo,
  },
  argTypes: { height: { control: { type: 'range', min: 160, max: 480, step: 20 } } },
} satisfies Meta<typeof AbsenteeismHoursChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
/** Con un promedio alto ninguna hora llega a ser crítica. */
export const SinHorasCriticas: Story = { args: { promedio: 60 } };
export const Loading: Story = { args: { loading: true } };
export const Empty: Story = { args: { porHora: [], porDiaFranja: [] } };
