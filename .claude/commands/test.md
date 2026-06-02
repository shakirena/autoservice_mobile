# /test — Testing Phase

Запускает qa-lead для unit testing и TC documentation. Gate: G5.

## Использование

```
/test #N
/test all    (все issues в kanban:testing)
```

## Что делает

Запускает агента **qa-lead** с указанными issues.

qa-lead выполняет полный Testing Flow:
1. Pre-flight: build OK + security:passed label есть?
2. WIP Check (≤ 5 in-testing)
3. Dependency Check
4. Параллельно: **tester** (unit tests, 95% coverage) + **test-case-writer** (TC docs)
5. **G5**: testing → ready-to-deploy
6. doc-sync: traceability update

## Ключевые проверки

- `security:passed` label **ОБЯЗАТЕЛЕН** — без него BLOCKED немедленно
- Coverage ≥ 95% (hotfix: ≥ 50%)
- Все тесты GREEN, time < 2 мин

## Аргументы

`$ARGUMENTS`:
- `#N` — конкретная story
- `all` — все issues с `kanban:testing`
