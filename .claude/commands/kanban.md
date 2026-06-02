# /kanban — Full Pipeline

Полный автоматический pipeline от идеи до деплоя: Feature → Analysis → Develop → Test → Deploy.

## Использование

```
/kanban <описание фичи>
```

## Что делает

Выполняет все 5 этапов последовательно:

```
1. /feature <описание>    → создаёт Feature Issue #N
2. /analyze #N            → analysis-lead (G1, G2) → Stories + Spec + Arch
3. /develop <stories>     → dev-lead (G3, G4) + security-reviewer
4. /test <stories>        → qa-lead (G5) + unit tests + TC docs  
5. /deploy staging        → ops-lead (G6) → EAS/OTA → done
```

## Порядок выполнения

```
feature (#N создан)
    ↓
analyze #N
    ↓
[stories #M, #K, #L созданы]
    ↓
develop #M #K #L  (параллельно где возможно)
    ↓
test all  (параллельно tester + test-case-writer)
    ↓
deploy staging
```

## Ошибки и остановки

- **G1/G2 BLOCKED** → остановка, требуется уточнение от человека
- **security:failed** (3 цикла) → BLOCKED, эскалация
- **G5 BLOCKED** (нет security:passed) → BLOCKED, запустить /develop
- **G6 BLOCKED** (health fail) → немедленный rollback

При любом BLOCKED — вывести детали и остановиться.

## Аргументы

`$ARGUMENTS` — полное описание фичи, которое будет передано в /feature
