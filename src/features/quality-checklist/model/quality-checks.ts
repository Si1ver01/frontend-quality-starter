export const QUALITY_CHECKS = [
  {
    id: 'types',
    category: 'Static analysis',
    label: 'TypeScript reports no errors',
    detail: 'Strict compiler options protect the application boundary.',
  },
  {
    id: 'lint',
    category: 'Static analysis',
    label: 'Lint and format checks pass',
    detail: 'Source code follows one predictable set of conventions.',
  },
  {
    id: 'unit',
    category: 'Testing',
    label: 'Component behavior is covered',
    detail: 'Fast tests exercise user-visible state transitions.',
  },
  {
    id: 'browser',
    category: 'Testing',
    label: 'Critical browser flow passes',
    detail: 'Playwright verifies the application in a real browser.',
  },
  {
    id: 'accessibility',
    category: 'User experience',
    label: 'Keyboard and accessibility checks pass',
    detail: 'Focus, semantics, and automated accessibility checks are reviewed.',
  },
  {
    id: 'release',
    category: 'Delivery',
    label: 'Release gate is green',
    detail: 'CI, documentation, and release artifacts are reproducible.',
  },
] as const;

export type QualityCheckId = (typeof QUALITY_CHECKS)[number]['id'];

const QUALITY_CHECK_IDS = new Set<QualityCheckId>(QUALITY_CHECKS.map(({ id }) => id));

export function isQualityCheckId(value: unknown): value is QualityCheckId {
  return typeof value === 'string' && QUALITY_CHECK_IDS.has(value as QualityCheckId);
}

export function normalizeCompletedIds(values: readonly unknown[]): QualityCheckId[] {
  return [...new Set(values.filter(isQualityCheckId))];
}

export function calculateProgress(completedCount: number) {
  return Math.round((completedCount / QUALITY_CHECKS.length) * 100);
}
