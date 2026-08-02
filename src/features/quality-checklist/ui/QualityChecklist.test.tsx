import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { QUALITY_CHECKS } from '../model/quality-checks';
import { QualityChecklist } from './QualityChecklist';

describe('QualityChecklist', () => {
  it('shows every release gate as pending initially', () => {
    render(<QualityChecklist storageKey={null} />);

    const checkboxes = screen.getAllByRole('checkbox');

    expect(checkboxes).toHaveLength(QUALITY_CHECKS.length);
    for (const checkbox of checkboxes) {
      expect(checkbox).not.toBeChecked();
    }
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0');
    expect(screen.getByRole('status')).toHaveTextContent('6 gates remain before release.');
  });

  it('updates release progress after a pointer interaction', async () => {
    const user = userEvent.setup();
    render(<QualityChecklist storageKey={null} />);

    const typecheckGate = screen.getByRole('checkbox', {
      name: /TypeScript reports no errors/i,
    });
    await user.click(typecheckGate);

    expect(typecheckGate).toBeChecked();
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '17');
    expect(screen.getByRole('status')).toHaveTextContent('5 gates remain before release.');
  });

  it('supports keyboard interaction and exposes an accessible checkbox name', async () => {
    const user = userEvent.setup();
    render(<QualityChecklist storageKey={null} />);

    await user.tab();
    const firstGate = screen.getByRole('checkbox', {
      name: /TypeScript reports no errors/i,
    });

    expect(firstGate).toHaveFocus();
    await user.keyboard(' ');
    expect(firstGate).toBeChecked();
  });

  it('announces the completed boundary state', () => {
    render(
      <QualityChecklist
        initialCompletedIds={QUALITY_CHECKS.map(({ id }) => id)}
        storageKey={null}
      />,
    );

    for (const checkbox of screen.getAllByRole('checkbox')) {
      expect(checkbox).toBeChecked();
    }
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '100');
    expect(screen.getByRole('status')).toHaveTextContent('All quality gates are complete.');
  });
});
