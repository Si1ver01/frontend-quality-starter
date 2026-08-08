# Frontend Quality Starter v0.1.1

Patch-релиз усиливает browser policy опубликованного starter и защищает цепочку создания GitHub
Release.

## Основное

- Production-only CSP разрешает scripts, styles и connections только с текущего origin, запрещает
  plugins, дочерние frames, отправку forms и inline scripts.
- Referrer policy ограничивает передачу URL при cross-origin переходах.
- Build checker и Playwright подтверждают наличие policies, отсутствие небезопасных CSP sources и
  фактическую блокировку inline script.
- Release workflow проверяет SemVer tag, точное совпадение с `package.json.version` и принадлежность
  tagged commit истории `main` до установки dependencies.
- Документация описывает разделённые GitHub tag rulesets для управляемого создания и неизменяемости
  release-тегов.

## Проверка

Release dry-run выполняет `npm run verify` и Playwright matrix для Chromium, Firefox и WebKit до
публикации artifacts.

## Ограничения

Шаблон является инженерной основой, а не обещанием production readiness или полного accessibility
compliance. Meta CSP на GitHub Pages не заменяет response-only headers, включая полноценную frame
protection, `X-Content-Type-Options` и `Permissions-Policy`. Для них нужен hosting или reverse proxy
с управлением response headers.
