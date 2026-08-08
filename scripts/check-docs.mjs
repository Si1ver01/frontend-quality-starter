import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const markdownFiles = [
  'README.md',
  'CONTRIBUTING.md',
  'CHANGELOG.md',
  'RELEASE_NOTES.md',
  'docs/getting-started.md',
  'docs/architecture.md',
  'docs/testing.md',
  'docs/delivery.md',
];
const requiredAssets = ['docs/assets/preview.png', 'docs/assets/preview-mobile.png'];
const documentedScripts = [
  'build',
  'dev',
  'docs:check',
  'release:check-tag',
  'storybook',
  'test',
  'test:coverage',
  'test:e2e',
  'test:e2e:install',
  'test:e2e:install:all',
  'verify',
];
const isDebugEnabled = Boolean(process.env.DEBUG) || process.env.LOG_LEVEL === 'DEBUG';

function log(level, message, context = {}) {
  if (level === 'DEBUG' && !isDebugEnabled) {
    return;
  }

  const write = level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.info;
  write(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      scope: 'scripts.check-docs',
      message,
      ...context,
    }),
  );
}

function extractMarkdownLinks(content) {
  return [...content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map((match) => match[1]);
}

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

try {
  const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
  const markdownEntries = await Promise.all(
    markdownFiles.map(async (path) => ({ path, content: await readFile(path, 'utf8') })),
  );
  const missingLinks = [];
  let externalLinkCount = 0;

  for (const { path, content } of markdownEntries) {
    for (const link of extractMarkdownLinks(content)) {
      if (/^(https?:|mailto:)/.test(link)) {
        externalLinkCount += 1;
        continue;
      }

      const [targetPath] = link.split('#');

      if (!targetPath) {
        continue;
      }

      const resolvedTarget = resolve(dirname(path), targetPath);
      if (!(await pathExists(resolvedTarget))) {
        missingLinks.push({ source: path, target: link });
      }
    }
  }

  const missingAssets = [];
  for (const assetPath of requiredAssets) {
    if (!(await pathExists(assetPath))) {
      missingAssets.push(assetPath);
    }
  }

  const missingScripts = documentedScripts.filter((script) => !packageJson.scripts?.[script]);
  const undocumentedScripts = documentedScripts.filter(
    (script) => !markdownEntries.some(({ content }) => content.includes(`npm run ${script}`)),
  );
  const readmeLineCount = markdownEntries
    .find(({ path }) => path === 'README.md')
    .content.split('\n').length;

  if (readmeLineCount > 150) {
    throw new Error(`README.md has ${readmeLineCount} lines; expected no more than 150.`);
  }

  if (
    missingLinks.length ||
    missingAssets.length ||
    missingScripts.length ||
    undocumentedScripts.length
  ) {
    throw new Error(
      JSON.stringify({ missingLinks, missingAssets, missingScripts, undocumentedScripts }),
    );
  }

  if (externalLinkCount > 0) {
    log('WARN', 'External links were not checked automatically', { externalLinkCount });
  }

  log('DEBUG', 'Visual documentation assets verified', {
    assets: requiredAssets,
    source: 'Playwright Chromium screenshots of the local Vite application',
  });

  log('INFO', 'Documentation check passed', {
    markdownFileCount: markdownEntries.length,
    localLinkCount:
      markdownEntries.reduce(
        (count, { content }) => count + extractMarkdownLinks(content).length,
        0,
      ) - externalLinkCount,
    documentedScriptCount: documentedScripts.length,
    assetCount: requiredAssets.length,
    readmeLineCount,
  });
} catch (error) {
  log('ERROR', 'Documentation check failed', {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exitCode = 1;
}
