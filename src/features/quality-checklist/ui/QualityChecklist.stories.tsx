import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { QUALITY_CHECKS } from '../model/quality-checks';
import { QualityChecklist } from './QualityChecklist';

const meta = {
  title: 'Features/Quality checklist',
  component: QualityChecklist,
  args: {
    storageKey: null,
  },
  decorators: [
    (Story) => (
      <main style={{ maxWidth: '74rem', margin: '0 auto' }}>
        <Story />
      </main>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'An accessible release-readiness checklist with persistent progress.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof QualityChecklist>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstGate = canvas.getByRole('checkbox', {
      name: /TypeScript reports no errors/i,
    });

    await userEvent.click(firstGate);
    await expect(firstGate).toBeChecked();
    await expect(canvas.getByRole('progressbar')).toHaveAttribute('value', '17');
  },
};

export const PartiallyCompleted: Story = {
  args: {
    initialCompletedIds: ['types', 'lint', 'unit'],
  },
};

export const Completed: Story = {
  args: {
    initialCompletedIds: QUALITY_CHECKS.map(({ id }) => id),
  },
};

export const NarrowViewport: Story = {
  args: {
    initialCompletedIds: ['types'],
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
