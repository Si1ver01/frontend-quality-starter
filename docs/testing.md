[← Архитектура](architecture.md) · [Назад к README](../README.md) · [Поставка →](delivery.md)

# Тестирование

## Разделение ответственности

| Слой          | Инструмент               | Проверяет                                         | Не дублирует           |
| ------------- | ------------------------ | ------------------------------------------------- | ---------------------- |
| Component     | Vitest + Testing Library | State transitions, accessible names, boundaries   | Полный browser flow    |
| Visual states | Storybook                | Default, partial, completed, mobile states        | Unit suite             |
| Browser       | Playwright + axe         | Pointer, keyboard, persistence, responsive layout | Все component branches |

Такое разделение удерживает suite быстрым и показывает назначение каждого инструмента после создания
нового репозитория из шаблона.

## Component tests

```bash
npm run test
npm run test:coverage
```

Vitest использует `jsdom`, фиксированный seed `20260803` и V8 coverage. Coverage report создаётся в
`coverage/`, но threshold не задан: после удаления демонстрационной feature новый проект должен
выбрать осмысленную политику сам.

## Storybook

```bash
npm run storybook
npm run storybook:build
```

Static build завершается `scripts/check-storybook.mjs`. Smoke-check читает Storybook index,
подтверждает основную story, печатает количество stories и output path.

## Browser tests

Первый локальный запуск требует Chromium:

```bash
npm run test:e2e:install
npm run test:e2e
```

По умолчанию Playwright запускает Chromium. Для отдельной release-проверки:

```bash
npm run test:e2e:install:all
PLAYWRIGHT_BROWSER=firefox npm run test:e2e
PLAYWRIGHT_BROWSER=webkit npm run test:e2e
```

При первом retry сохраняется trace; screenshot и video сохраняются только при сбое. Paths к
artifacts печатаются в error context и загружаются CI на семь дней.

## Accessibility

Automated axe scan использует WCAG 2 A/AA tags и должен завершаться без violations. Это полезный
gate, но не доказательство полного соответствия: keyboard flow, focus visibility и содержание всё
равно требуют ручной проверки.

## См. также

- [Архитектура](architecture.md) — colocated tests и module boundaries.
- [Поставка](delivery.md) — test gates в CI и release matrix.
- [CONTRIBUTING.md](../CONTRIBUTING.md) — обязательные проверки перед pull request.
