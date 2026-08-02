# Участие в разработке

Спасибо за вклад в `frontend-quality-starter`. Изменения должны сохранять одну понятную роль
шаблона: давать небольшой, проверяемый baseline без лишних product features.

## Подготовка

```bash
git clone https://github.com/ddanshin94/frontend-quality-starter.git
cd frontend-quality-starter
nvm use
npm ci
npm run test:e2e:install
```

## Перед pull request

```bash
npm run verify
npm run test:e2e
```

Также проверьте keyboard navigation, focus visibility и mobile layout вручную. Новая feature должна
иметь ясную причину существования и не дублировать назначение уже подключённого инструмента.

## Структура изменений

- Размещайте пользовательское поведение в `src/features/<feature>/`.
- Экспортируйте feature только через её `index.ts`.
- Не импортируйте `app` или `features` из `shared`.
- Храните component tests и stories рядом с компонентом, browser tests — в `e2e/`.
- Добавляйте configurable structured logging для state changes и errors, не выводя secrets.

## Коммиты

Сообщения коммитов пишутся на английском языке по Conventional Commits:

```text
feat: add quality gate filter
fix: preserve checklist state after reload
docs: clarify release dry run
```

Не создавайте пустые коммиты и не дробите одно изменение ради количества activity events.

## Pull request

Опишите проблему, выбранное решение, выполненные проверки и visual impact. Приложите screenshot для
изменений UI. Не заявляйте production readiness, security или accessibility compliance без
проверяемых доказательств.
