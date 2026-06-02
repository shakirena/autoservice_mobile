# /analyze — Analysis Phase

Запускает analysis-lead для декомпозиции фичи. Gates: G1, G2.

## Использование

```
/analyze #N
```

## Что делает

Запускает агента **analysis-lead** с issue #N.

analysis-lead выполняет полный Analysis Flow:
1. Читает контекст проекта (memory/)
2. **G1**: backlog → analysis (business value, AC, тип, приоритет)
3. Параллельно: **analyst** (декомпозиция + spec) + **architect** (arch doc + stubs)
4. **G2**: analysis → ready-for-dev (SD-1..SD-5, INVEST, arch doc)
5. doc-sync: обновить traceability.md

## Вывод

analysis-lead сообщает:
- Созданные Story Issues с номерами
- Путь к spec документу
- Путь к arch документу
- G1 и G2 Gate Reports
- Статус: PASS / BLOCKED

## Аргументы

`$ARGUMENTS` содержит номер issue: `#N` или `N`

Используй: `gh issue view #N --json title,body,labels,comments`
