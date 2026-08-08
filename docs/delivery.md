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

Production-сборка получает доступные на статическом хостинге browser policies: build-only CSP
ограничивает источники ресурсов, запрещает plugins, дочерние frames и inline scripts, а
`strict-origin-when-cross-origin` сокращает данные в cross-origin `Referer`. Development server не
получает CSP, потому что React Refresh и Vite HMR требуют inline code и WebSocket. GitHub Pages не
позволяет репозиторию задавать response headers, поэтому meta policy не заменяет response-only HSTS,
`X-Content-Type-Options`, frame protection и `Permissions-Policy`. Для полного набора headers нужен
управляемый reverse proxy или другой хостинг.

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
job с `contents: write` использует `RELEASE_NOTES.md` и прикладывает два `.tar.gz` artifact. До
установки dependencies workflow проверяет, что tag имеет вид `v<SemVer>`, совпадает с version в
`package.json` и указывает на commit из истории `origin/main`. Ту же проверку можно выполнить
локально:

```bash
RELEASE_TAG=v0.1.0 RELEASE_MAIN_REF=origin/main npm run release:check-tag
```

### Защита release-тегов

Repository workflow не может запретить передвижение или удаление tag, поэтому настройте в GitHub
`Settings → Rules → Rulesets` два active tag rulesets с target pattern `v*`:

1. `Restrict release creation`: включите только **Restrict creations**, добавьте bypass
   `Repository admin` с режимом **Always**.
2. `Immutable releases`: включите **Restrict updates** и **Restrict deletions**, оставьте bypass
   list пустым.

Разделение важно: bypass действует на все правила внутри ruleset. Такая конфигурация разрешает
администратору создавать release-теги, но не позволяет обычным push передвинуть или удалить уже
созданный tag. Для аварийного изменения второй ruleset потребуется явно временно отключить.

Перед tag вручную проверьте:

- `CHANGELOG.md` и `RELEASE_NOTES.md` соответствуют версии;
- Pages и required checks включены;
- repository отмечен как **Template repository**;
- README links и screenshot открываются;
- branch `main` проходит CI;
- оба tag rulesets включены и имеют target pattern `v*`.

## См. также

- [Начало работы](getting-started.md) — локальная установка.
- [Тестирование](testing.md) — состав quality gates.
- [CHANGELOG.md](../CHANGELOG.md) — история версии.
