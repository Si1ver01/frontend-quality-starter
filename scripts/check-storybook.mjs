import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const outputDirectory = resolve('storybook-static');
const indexPath = resolve(outputDirectory, 'index.json');
const requiredStoryId = 'features-quality-checklist--default';

try {
  const index = JSON.parse(await readFile(indexPath, 'utf8'));
  const storyEntries = Object.values(index.entries ?? {}).filter((entry) => entry.type === 'story');
  const hasRequiredStory = storyEntries.some((entry) => entry.id === requiredStoryId);

  if (!hasRequiredStory) {
    throw new Error(`Required story "${requiredStoryId}" is missing from the static index.`);
  }

  console.info(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      scope: 'scripts.check-storybook',
      message: 'Storybook static smoke check passed',
      storyCount: storyEntries.length,
      outputDirectory,
      requiredStoryId,
    }),
  );
} catch (error) {
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      scope: 'scripts.check-storybook',
      message: 'Storybook static smoke check failed',
      indexPath,
      error: error instanceof Error ? error.message : String(error),
    }),
  );
  process.exitCode = 1;
}
