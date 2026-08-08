import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, it } from 'node:test';

import { checkReleaseTagPolicy, validateReleaseTag } from './check-release-tag.mjs';

const temporaryRepositories = [];

function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

async function createRepository(version = '1.2.3') {
  const cwd = await mkdtemp(join(tmpdir(), 'release-tag-policy-'));
  temporaryRepositories.push(cwd);
  git(cwd, 'init', '--initial-branch=main');
  git(cwd, 'config', 'user.name', 'Release Policy Test');
  git(cwd, 'config', 'user.email', 'release-policy@example.invalid');
  await writeFile(join(cwd, 'package.json'), `${JSON.stringify({ version })}\n`);
  git(cwd, 'add', 'package.json');
  git(cwd, 'commit', '-m', 'test: create release candidate');

  return cwd;
}

afterEach(async () => {
  await Promise.all(temporaryRepositories.splice(0).map((path) => rm(path, { recursive: true })));
});

describe('validateReleaseTag', () => {
  it('accepts a tag matching the package SemVer version', () => {
    assert.doesNotThrow(() => validateReleaseTag('v1.2.3-beta.1+build.5', '1.2.3-beta.1+build.5'));
  });

  it('rejects an unexpected prefix', () => {
    assert.throws(() => validateReleaseTag('release-1.2.3', '1.2.3'));
  });

  it('rejects a tag that differs from the package version', () => {
    assert.throws(() => validateReleaseTag('v1.2.4', '1.2.3'));
  });

  it('rejects a package version with a leading zero', () => {
    assert.throws(() => validateReleaseTag('v01.2.3', '01.2.3'));
  });
});

describe('checkReleaseTagPolicy', () => {
  it('accepts an annotated tag whose commit belongs to main', async () => {
    const cwd = await createRepository();
    git(cwd, 'tag', '--annotate', 'v1.2.3', '--message', 'Release v1.2.3');

    const result = await checkReleaseTagPolicy({ cwd, tag: 'v1.2.3', mainRef: 'main' });

    assert.equal(result.packageVersion, '1.2.3');
    assert.equal(result.tag, 'v1.2.3');
  });

  it('rejects a tag whose commit is outside main history', async () => {
    const cwd = await createRepository();
    git(cwd, 'switch', '--quiet', '--create', 'detached-release');
    await writeFile(join(cwd, 'candidate.txt'), 'not merged\n');
    git(cwd, 'add', 'candidate.txt');
    git(cwd, 'commit', '-m', 'test: create unmerged release');
    git(cwd, 'tag', 'v1.2.3');

    await assert.rejects(
      checkReleaseTagPolicy({ cwd, tag: 'v1.2.3', mainRef: 'main' }),
      /is not an ancestor of main/,
    );
  });
});
