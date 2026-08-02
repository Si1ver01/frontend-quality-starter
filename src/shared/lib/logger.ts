type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'SILENT';

type LogContext = Readonly<Record<string, unknown>>;

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  DEBUG: 10,
  INFO: 20,
  WARN: 30,
  ERROR: 40,
  SILENT: 50,
};

function resolveLogLevel(): LogLevel {
  const configuredLevel = import.meta.env.VITE_LOG_LEVEL;

  if (configuredLevel && configuredLevel in LOG_LEVEL_PRIORITY) {
    return configuredLevel;
  }

  return import.meta.env.DEV ? 'DEBUG' : 'SILENT';
}

const activeLogLevel = resolveLogLevel();

function writeLog(
  level: Exclude<LogLevel, 'SILENT'>,
  scope: string,
  message: string,
  context: LogContext,
) {
  if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[activeLogLevel]) {
    return;
  }

  const payload = {
    timestamp: new Date().toISOString(),
    level,
    scope,
    message,
    ...context,
  };

  if (level === 'ERROR') {
    console.error(payload);
    return;
  }

  if (level === 'WARN') {
    console.warn(payload);
    return;
  }

  console.info(payload);
}

export function createLogger(scope: string) {
  return {
    debug(message: string, context: LogContext = {}) {
      writeLog('DEBUG', scope, message, context);
    },
    info(message: string, context: LogContext = {}) {
      writeLog('INFO', scope, message, context);
    },
    warn(message: string, context: LogContext = {}) {
      writeLog('WARN', scope, message, context);
    },
    error(message: string, context: LogContext = {}) {
      writeLog('ERROR', scope, message, context);
    },
  };
}
