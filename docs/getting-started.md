[Назад к README](../README.md) · [Архитектура →](architecture.md)

# Начало работы

## Требования

| Инструмент |                       Поддерживаемая версия | Проверка         |
| ---------- | ------------------------------------------: | ---------------- |
| Node.js    |                         `24.18.0` или новее | `node --version` |
| npm        |                         `11.16.0` или новее | `npm --version`  |
| Git        |                       актуальная стабильная | `git --version`  |
| Browser    | 2 последние Chrome/Edge/Firefox, Safari 17+ | release matrix   |

`.nvmrc` фиксирует Node.js `24.18.0`. При установленном NVM выполните `nvm use` из корня
репозитория.

## Установка

```bash
git clone https://github.com/ddanshin94/frontend-quality-starter.git
cd frontend-quality-starter
nvm use
npm ci
```

`npm ci` использует committed `package-lock.json` и не изменяет версии зависимостей.

## TypeScript и ESLint

Проект использует TypeScript 7 для `typecheck` и сборки. Для `typescript-eslint` подключён
совместимый TypeScript 6 API через alias `typescript: npm:@typescript/typescript6`. Это временная
схема совместимости до появления нового compiler API в TypeScript 7.1.

Проверить версии можно так:

```bash
npx tsc --version
npx tsc6 --version
```

`eslint-plugin-jsx-a11y` версии `6.10.2` уже проходит lint на ESLint 10, но его опубликованный
peer-диапазон пока заканчивается на ESLint 9. Поэтому `.npmrc` включает `legacy-peer-deps=true`,
чтобы `npm ci` воспроизводимо устанавливал проверенную комбинацию.

## Первый запуск

```bash
npm run dev
```

Ожидаемый результат: Vite печатает локальный URL, а страница показывает шесть release-readiness
gates. Измените один checkbox и перезагрузите страницу — прогресс должен сохраниться.

## Основные команды

| Команда                        | Назначение                                        |
| ------------------------------ | ------------------------------------------------- |
| `npm run dev`                  | Запустить Vite development server                 |
| `npm run build`                | Выполнить typecheck и собрать приложение          |
| `npm run verify`               | Запустить все gates без browser tests             |
| `npm run test`                 | Выполнить component tests                         |
| `npm run test:coverage`        | Создать V8 coverage report                        |
| `npm run test:e2e:install`     | Установить локальный Chromium                     |
| `npm run test:e2e:install:all` | Установить Chromium, Firefox и WebKit             |
| `npm run test:e2e`             | Выполнить Playwright suite                        |
| `npm run storybook`            | Запустить Storybook на порту 6006                 |
| `npm run docs:check`           | Проверить локальные ссылки и команды документации |

## Логирование

Все npm scripts проходят через `scripts/run-commands.mjs`. Runner сохраняет exit code дочерней
команды и печатает stage, runtime versions и duration.

```bash
LOG_LEVEL=DEBUG npm run build
```

Browser tests также принимают `DEBUG=1`. Production-приложение по умолчанию использует
`VITE_LOG_LEVEL=SILENT`; допустимы `DEBUG`, `INFO`, `WARN`, `ERROR` и `SILENT`.

## См. также

- [Архитектура](architecture.md) — размещение кода и правила импортов.
- [Тестирование](testing.md) — границы между тремя test layers.
- [CONTRIBUTING.md](../CONTRIBUTING.md) — порядок подготовки изменений.
