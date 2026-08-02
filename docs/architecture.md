[← Начало работы](getting-started.md) · [Назад к README](../README.md) ·
[Тестирование →](testing.md)

# Архитектура

## Модель модулей

Проект использует Structured Modules с односторонним направлением зависимостей:

```text
main → app → features → shared
```

- `main` только создаёт React root и запускает приложение.
- `app` собирает экран из feature-модулей.
- `features` содержат пользовательское поведение и экспортируют публичный `index.ts`.
- `shared` предоставляет общие стили, logger и нейтральные primitives.

`shared` не импортирует `features` или `app`. Прямые импорты внутренних файлов одной feature из
другой запрещены.

## Структура

```text
src/
├── app/                         # композиция страницы
├── features/
│   └── quality-checklist/
│       ├── model/               # данные и чистые вычисления
│       ├── ui/                  # компонент, styles, tests, stories
│       └── index.ts             # публичный API
├── shared/
│   ├── lib/logger.ts            # environment-controlled logging
│   └── styles/global.css        # общие tokens и reset
├── test/setup.ts                # Vitest environment
└── main.tsx                     # entry point
```

Browser tests находятся в `e2e/`, Storybook config — в `.storybook/`, delivery automation — в
`.github/workflows/`. Generated outputs (`dist`, `coverage`, `storybook-static`, Playwright reports)
не входят в source tree.

## Поток состояния checklist

1. Компонент валидирует значения из `localStorage` через `normalizeCompletedIds`.
2. Native checkbox инициирует одно state transition.
3. Progress вычисляется чистой функцией `calculateProgress`.
4. Новое состояние сохраняется в browser storage.
5. Live region сообщает итог assistive technologies.

Ошибки чтения или записи storage не ломают UI: logger фиксирует контекст на `ERROR`, а компонент
использует безопасное начальное состояние.

## Конфигурация toolchain

- `vite.config.ts` задаёт React plugin, alias `@` и Pages base path.
- `vitest.config.ts` расширяет Vite config и владеет только `src/**/*.test.*`.
- `playwright.config.ts` владеет `e2e/` и выбирает browser через `PLAYWRIGHT_BROWSER`.
- Storybook использует `@storybook/react-vite`, поэтому не создаёт второй build pipeline.

Production dependencies ограничены `react` и `react-dom`; остальные packages являются
`devDependencies`.

## См. также

- [Начало работы](getting-started.md) — установка и команды.
- [Тестирование](testing.md) — ответственность каждого test layer.
- [Поставка](delivery.md) — использование архитектурных gates в CI.
