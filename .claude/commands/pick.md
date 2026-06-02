# /pick — Взять следующую задачу

Выбирает следующую задачу из указанной колонки по приоритету и запускает соответствующий Team Lead.

## Использование

```
/pick <колонка>
/pick ready-for-dev
/pick backlog
/pick testing
/pick ready-to-deploy
```

## Алгоритм выбора

Приоритет: `priority:critical` → `priority:high` → `priority:medium` → `priority:low`

```bash
# Получить следующую задачу по приоритету
COLUMN="kanban:$1"

for PRIORITY in "priority:critical" "priority:high" "priority:medium" "priority:low"; do
  ISSUE=$(gh issue list \
    --label "$COLUMN,$PRIORITY" \
    --json number,title,labels \
    --limit 1 | jq -r '.[0] | "#\(.number): \(.title)"')
  
  if [ "$ISSUE" != "null" ] && [ -n "$ISSUE" ]; then
    echo "Следующая задача ($PRIORITY): $ISSUE"
    break
  fi
done
```

## Действия после выбора

| Колонка | Действие |
|---------|---------|
| `backlog` | `/analyze #N` |
| `ready-for-dev` | `/develop #N` |
| `testing` | `/test #N` |
| `ready-to-deploy` | `/deploy staging` |

## Dependency Check

Перед выбором проверить нет ли blockers у top-priority issue:
```bash
gh issue view #N --json body | jq -r '.body' | grep -i "blocked by\|depends on"
```

Если blocked → взять следующую задачу того же приоритета без блокера.

## Аргументы

`$ARGUMENTS` — название колонки (без префикса kanban:):
- `backlog`, `analysis`, `ready-for-dev`, `in-development`, `testing`, `ready-to-deploy`
