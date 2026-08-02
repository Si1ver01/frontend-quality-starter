# Frontend Quality Starter v0.1.0

Первый релиз готового GitHub Template repository для React, Vite и TypeScript.

## Основное

- Единый `npm run verify` для format, lint, typecheck, component tests, application build, Storybook
  и документации.
- Playwright browser gate для pointer, keyboard, responsive layout, persistence и axe.
- Четыре Storybook states с accessibility addon и static smoke-check.
- CI с pinned Actions, минимальными permissions и diagnostic artifacts.
- GitHub Pages demo и release workflow с Chromium/Firefox/WebKit matrix.

## Ограничения

Шаблон является инженерной основой, а не обещанием production readiness или полного accessibility
compliance. Новый проект должен пересмотреть coverage, browser support и release policy под свой
реальный сценарий.
