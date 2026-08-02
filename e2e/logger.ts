type E2eLogLevel = 'DEBUG' | 'INFO' | 'ERROR';

const isDebugEnabled = Boolean(process.env.DEBUG) || process.env.LOG_LEVEL === 'DEBUG';

export function logE2e(
  level: E2eLogLevel,
  message: string,
  context: Readonly<Record<string, unknown>> = {},
) {
  if (level === 'DEBUG' && !isDebugEnabled) {
    return;
  }

  const payload = {
    timestamp: new Date().toISOString(),
    level,
    scope: 'e2e',
    message,
    ...context,
  };

  if (level === 'ERROR') {
    console.error(payload);
    return;
  }

  console.info(payload);
}
