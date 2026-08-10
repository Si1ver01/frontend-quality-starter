# История изменений

Формат основан на Keep a Changelog, версии следуют Semantic Versioning.

## [Unreleased]

### Changed

- Пока нет изменений после `0.1.1`.

## [0.1.1] - 2026-08-08

### Changed

- Playwright browser gate теперь проверяет production build через Vite preview.
- Документация описывает ограничения meta policies на GitHub Pages и настройку tag rulesets.

### Security

- Production build получает строгую CSP без `unsafe-inline`, `unsafe-eval` и wildcard sources, а
  также `strict-origin-when-cross-origin` referrer policy.
- Build и browser tests проверяют наличие policies и блокировку inline scripts.
- Release workflow принимает только tag, совпадающий с `package.json.version` и указывающий на
  commit из истории `main`.

## [0.1.0] - 2026-08-03

### Added

- Strict React 19, Vite 8 и TypeScript 7 starter с npm lockfile.
- Доступный quality checklist с persistent progress и structured logging.
- ESLint, Prettier, Vitest, Testing Library, Storybook, Playwright и axe gates.
- CI, GitHub Pages, release dry-run и трехбраузерный release workflow.
- Русскоязычная документация, contribution guide и visual assets.

[Unreleased]: https://github.com/Si1ver01/frontend-quality-starter/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/Si1ver01/frontend-quality-starter/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/Si1ver01/frontend-quality-starter/releases/tag/v0.1.0
