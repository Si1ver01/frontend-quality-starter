[← Тестирование](testing.md) · [Назад к README](../README.md)

# Поставка

## CI

`.github/workflows/ci.yml` запускается для push и pull request:

```text
npm ci → npm run verify → Chromium E2E
```

Workflow использует read-only `contents` permission, отменяет устаревшие runs для того же ref и
хранит coverage, Storybook и Playwright diagnostics семь дней. Сторонние Actions закреплены по
полному commit SHA; комментарий рядом сохраняет соответствующий release tag.

## Demo на GitHub Pages

`.github/workflows/pages.yml` собирает `main` с `VITE_BASE_PATH=/frontend-quality-starter/` и
публикует `dist/`. Для запуска нужны включённые GitHub Pages с источником **GitHub Actions**.

При другом имени репозитория обновите `VITE_BASE_PATH` в workflow. Для custom domain используйте `/`
и настройте домен в repository settings.

## Release dry-run

Запустите workflow **Release** вручную через `workflow_dispatch`. Он выполняет:

1. clean install и полный `npm run verify`;
2. упаковку application и Storybook artifacts;
3. Playwright matrix для Chromium, Firefox и WebKit;
4. dry-run confirmation без создания tag или GitHub Release.

Это проверяет permissions, browser dependencies и artifacts до первого semver tag.

## Выпуск версии

```bash
git tag v0.1.0
git push origin v0.1.0
```

Tag workflow повторяет dry-run gates и только после их успеха создаёт GitHub Release. Единственный
job с `contents: write` использует `RELEASE_NOTES.md` и прикладывает два `.tar.gz` artifact.

Перед tag вручную проверьте:

- `CHANGELOG.md` и `RELEASE_NOTES.md` соответствуют версии;
- Pages и required checks включены;
- repository отмечен как **Template repository**;
- README links и screenshot открываются;
- branch `main` проходит CI.

## См. также

- [Начало работы](getting-started.md) — локальная установка.
- [Тестирование](testing.md) — состав quality gates.
- [CHANGELOG.md](../CHANGELOG.md) — история версии.
