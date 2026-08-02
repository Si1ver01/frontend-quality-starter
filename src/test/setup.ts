import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

import { createLogger } from '@/shared/lib/logger';

const logger = createLogger('test.setup');

logger.debug('Test environment initialized', {
  environment: 'jsdom',
  seed: 20260803,
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  logger.debug('Test environment reset');
});
