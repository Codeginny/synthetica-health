import type { Meta, StoryObj } from '@storybook/react';
import { TrendChart } from './TrendChart';
import { mockDashboard } from '@/mocks/dashboard';

const anchor = new Date('2026-11-10T12:00:00');
const serie = mockDashboard({ from: '2026-10-12', to: '2026-11-10', doctor: null, status: null }, anchor).serie;

const meta = {
  title: 'Dashboard/TrendChart',
  component: TrendChart,
  args: { data: serie, loading: false, height: 280 },
  argTypes: { height: { control: { type: 'range', min: 160, max: 480, step: 20 } }, data: { control: 'object' } },
} satisfies Meta<typeof TrendChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const UltimaSemana: Story = { args: { data: serie.slice(-7) } };
export const Loading: Story = { args: { loading: true } };
export const Empty: Story = { args: { data: [] } };
