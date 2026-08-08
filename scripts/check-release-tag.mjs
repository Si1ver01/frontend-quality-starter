import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const FIX_SCOPE = '[FIX:release-tag-policy]';
const SEMVER_PATTERN =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

function log(level, message, context = {}) {
  const write = level === 'ERROR' ? console.error : console.info;
  write(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      scope: FIX_SCOPE,
      message,
      ...context,
    }),
  );
}

function runGit(args, cwd, acceptedExitCodes = [0]) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.error) {
    throw new Error(`Could not run git: ${result.error.message}`);
  }

  if (!acceptedExitCodes.includes(result.status)) {
    throw new Error(
      result.stderr.trim() || `git ${args[0]} failed with exit code ${result.status}.`,
    );
  }

  return { status: result.status, stdout: result.stdout.trim() };
}

export function validateReleaseTag(tag, packageVersion) {
  if (!tag) {
    throw new Error('RELEASE_TAG is required.');
  }

  if (!SEMVER_PATTERN.test(packageVersion)) {
    throw new Error(`package.json version "${packageVersion}" is not valid SemVer.`);
  }

  const expectedTag = `v${packageVersion}`;
  if (tag !== expectedTag) {
    throw new Error(`Release tag "${tag}" must match package.json version as "${expectedTag}".`);
  }
}

export async function checkReleaseTagPolicy({
  cwd = process.cwd(),
  tag = process.env.RELEASE_TAG,
  mainRef = process.env.RELEASE_MAIN_REF ?? 'origin/main',
} = {}) {
  const packageJson = JSON.parse(await readFile(resolve(cwd, 'package.json'), 'utf8'));
  const packageVersion = packageJson.version;

  if (typeof packageVersion !== 'string') {
    throw new Error('package.json version must be a string.');
  }

  validateReleaseTag(tag, packageVersion);

  const tagRef = `refs/tags/${tag}`;
  const taggedCommit = runGit(['rev-parse', '--verify', `${tagRef}^{commit}`], cwd).stdout;
  const mainCommit = runGit(['rev-parse', '--verify', `${mainRef}^{commit}`], cwd).stdout;
  const ancestryCheck = runGit(
    ['merge-base', '--is-ancestor', taggedCommit, mainCommit],
    cwd,
    [0, 1],
  );

  if (ancestryCheck.status !== 0) {
    throw new Error(`Tagged commit ${taggedCommit} is not an ancestor of ${mainRef}.`);
  }

  return { mainRef, packageVersion, tag, taggedCommit };
}

async function main() {
  const tag = process.env.RELEASE_TAG;
  const mainRef = process.env.RELEASE_MAIN_REF ?? 'origin/main';
  log('INFO', 'Release tag validation started', { tag, mainRef });

  try {
    const result = await checkReleaseTagPolicy({ tag, mainRef });
    log('INFO', 'Release tag validation passed', result);
  } catch (error) {
    log('ERROR', 'Release tag validation failed', {
      tag,
      mainRef,
      error: error instanceof Error ? error.message : String(error),
    });
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
