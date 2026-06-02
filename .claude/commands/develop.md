# /develop — Development Phase

Запускает dev-lead для реализации stories. Gates: G3, G4 + Security Review.

## Использование

```
/develop #N
/develop #N #M #K    (несколько stories параллельно)
```

## Что делает

Запускает агента **dev-lead** с указанными issue номерами.

dev-lead выполняет полный Development Flow:
1. WIP Check (≤ 5 in-development)
2. Dependency Check (blockers resolved?)
3. **G3**: ready-for-dev → in-development
4. **developer** в worktree: Data Layer → Service → API → UI + unit tests
5. **G4**: code review (build, lint, tests, no TODO)
6. **security-reviewer**: OWASP, Firebase Security Rules (max 3 цикла)
7. Только после `security:passed` → `kanban:testing`
8. doc-sync: обновить traceability.md

## Аргументы

`$ARGUMENTS` содержит номера issues через пробел: `#3 #4 #5` или `3 4 5`

dev-lead определяет порядок через dependency graph и запускает параллельно где возможно.
