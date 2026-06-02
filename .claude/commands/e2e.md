# /e2e — E2E Tests

Запускает e2e-tester для создания Detox E2E тестов из TC-документации. Отдельный поток — не блокирует деплой.

## Использование

```
/e2e #N
/e2e all
```

## Что делает

Запускает агента **e2e-tester** (opus).

e2e-tester:
1. Читает `docs/test-cases/feature-{N}-{name}.md`
2. Создаёт Page Objects в `e2e-tests/pages/`
3. Создаёт E2E тесты в `e2e-tests/tests/`
4. Автоматизирует Critical и High priority TCs обязательно
5. Только `[data-testid]` / `by.id()` селекторы (Detox)
6. Обновляет TC traceability (E2E Automated: Yes)

## Стек

- **Detox** — тест-раннер для React Native
- **Jest** — assertion framework  
- **Page Object** паттерн

## Когда запускать

После деплоя на staging. E2E не блокирует pipeline, запускается отдельно.

## Аргументы

`$ARGUMENTS`:
- `#N` — E2E для конкретной фичи
- `all` — все фичи с TC docs
