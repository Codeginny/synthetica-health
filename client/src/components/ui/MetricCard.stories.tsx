import type { Meta, StoryObj } from '@storybook/react';
import { CalendarCheck, UserX } from 'lucide-react';
import { MetricCard } from './MetricCard';

const meta = {
  title: 'Dashboard/MetricCard',
  component: MetricCard,
  args: { label: 'Turnos completados', value: 1284, hint: '42 pendientes', tone: 'brand', loading: false, icon: <CalendarCheck className="h-5 w-5" /> },
  argTypes: {
    tone: { control: 'inline-radio', options: ['brand', 'neutral', 'danger'] },
    value: { control: 'text' },
    icon: { control: false },
  },
  decorators: [(Story) => <div className="max-w-xs"><Story /></div>],
} satisfies Meta<typeof MetricCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Ausentismo: Story = { args: { label: 'Ausentismo', value: '17.4%', hint: '96 cancelados', tone: 'danger', icon: <UserX className="h-5 w-5" /> } };
export const Loading: Story = { args: { loading: true } };
