import { spawn } from 'node:child_process';

const LOG_LEVELS = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'SILENT'];
const requestedLogLevel = process.env.LOG_LEVEL?.toUpperCase();
const activeLogLevel = process.env.DEBUG
  ? 'DEBUG'
  : LOG_LEVELS.includes(requestedLogLevel)
    ? requestedLogLevel
    : 'INFO';

function log(level, message, context = {}) {
  if (LOG_LEVELS.indexOf(level) < LOG_LEVELS.indexOf(activeLogLevel)) {
    return;
  }

  const write = level === 'ERROR' ? console.error : console.log;
  write(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      scope: 'scripts.run-commands',
      message,
      ...context,
    }),
  );
}

function parseCommands(tokens) {
  const commands = [];
  let currentCommand = [];

  for (const token of tokens) {
    if (token === ':::') {
      if (currentCommand.length > 0) {
        commands.push(currentCommand);
        currentCommand = [];
      }
      continue;
    }

    currentCommand.push(token);
  }

  if (currentCommand.length > 0) {
    commands.push(currentCommand);
  }

  return commands;
}

function runCommand([command, ...args], stage, commandIndex) {
  return new Promise((resolve, reject) => {
    const isPlaywrightCommand =
      command === 'playwright' || (command === 'npx' && args[0] === 'playwright');
    log('DEBUG', 'Starting command', { stage, commandIndex, command, args });

    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: {
        ...process.env,
        ...(command === 'storybook' ? { STORYBOOK_DISABLE_TELEMETRY: '1' } : {}),
        ...(isPlaywrightCommand ? { PLAYWRIGHT_BROWSERS_PATH: '0' } : {}),
      },
      stdio: 'inherit',
    });

    child.once('error', (error) => {
      log('ERROR', 'Command could not start', {
        stage,
        commandIndex,
        command,
        error: error.message,
      });
      reject(error);
    });

    child.once('exit', (exitCode, signal) => {
      if (exitCode === 0) {
        log('DEBUG', 'Command completed', { stage, commandIndex, command });
        resolve();
        return;
      }

      const error = new Error(
        `Command "${command}" failed with exit code ${String(exitCode)}${signal ? ` and signal ${signal}` : ''}.`,
      );
      log('ERROR', 'Command failed', {
        stage,
        commandIndex,
        command,
        exitCode,
        signal,
      });
      reject(error);
    });
  });
}

const [stage, ...commandTokens] = process.argv.slice(2);
const commands = parseCommands(commandTokens);

if (!stage || commands.length === 0 || commands.some((command) => command.length === 0)) {
  log(
    'ERROR',
    'Usage: node scripts/run-commands.mjs <stage> <command> [args...] [::: <command> ...]',
  );
  process.exitCode = 2;
} else {
  const startedAt = performance.now();
  log('INFO', 'Stage started', {
    stage,
    nodeVersion: process.version,
    packageManager: process.env.npm_config_user_agent?.split(' ')[0] ?? 'unknown',
    commandCount: commands.length,
  });

  try {
    for (const [commandIndex, command] of commands.entries()) {
      await runCommand(command, stage, commandIndex + 1);
    }

    log('INFO', 'Stage completed', {
      stage,
      durationMs: Math.round(performance.now() - startedAt),
    });
  } catch (error) {
    log('ERROR', 'Stage failed', {
      stage,
      durationMs: Math.round(performance.now() - startedAt),
      error: error instanceof Error ? error.message : String(error),
    });
    process.exitCode = 1;
  }
}
