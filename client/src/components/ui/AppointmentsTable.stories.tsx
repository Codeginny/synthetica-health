import type { Meta, StoryObj } from '@storybook/react';
import { AppointmentsTable } from './AppointmentsTable';
import { generateAppointments } from '@/mocks/dashboard';

const rows = generateAppointments(new Date('2026-11-10T12:00:00'), 5);

const meta = {
  title: 'Dashboard/AppointmentsTable',
  component: AppointmentsTable,
  args: { rows, loading: false, limit: 10 },
  argTypes: { limit: { control: { type: 'number', min: 1, max: 50 } }, rows: { control: 'object' } },
} satisfies Meta<typeof AppointmentsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const SoloCancelados: Story = { args: { rows: rows.filter((r) => r.estado === 'cancelado') } };
export const Loading: Story = { args: { loading: true } };
export const Empty: Story = { args: { rows: [] } };
