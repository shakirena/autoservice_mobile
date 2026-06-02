# /board — Kanban Board Visualizer

Показывает состояние Kanban-доски: колонки, WIP, блокировки, зависимости, метрики.

## Использование

```
/board
```

## Что выводит

Выполни следующие команды и сформатируй результат:

```bash
# Все kanban columns
for LABEL in "kanban:backlog" "kanban:analysis" "kanban:ready-for-dev" "kanban:in-development" "kanban:testing" "kanban:ready-to-deploy" "kanban:done"; do
  echo "--- ${LABEL} ---"
  gh issue list --label "$LABEL" --json number,title,labels --limit 20 | \
    jq -r '.[] | "#\(.number): \(.title)"'
done

# WIP metrics
IN_DEV=$(gh issue list --label "kanban:in-development" --json number | jq length)
IN_TEST=$(gh issue list --label "kanban:testing" --json number | jq length)
echo "WIP: Dev=$IN_DEV/5, Test=$IN_TEST/5"

# Blocked issues
gh issue list --label "blocked" --json number,title | \
  jq -r '.[] | "🚫 #\(.number): \(.title)"'

# Security status
gh issue list --label "security:failed" --json number,title | \
  jq -r '.[] | "🔴 security:failed #\(.number): \(.title)"'

# QA failures
gh issue list --label "qa:failed" --json number,title | \
  jq -r '.[] | "❌ qa:failed #\(.number): \(.title)"'
```

## Формат вывода

```
╔══════════════════════════════════════════════════════════╗
║                    KANBAN BOARD                          ║
╠══════════════════════════════════════════════════════════╣
║ BACKLOG           │ ANALYSIS         │ READY FOR DEV    ║
║ #9: Feature X     │ #8: Story A      │ #7: Story B      ║
╠══════════════════════════════════════════════════════════╣
║ IN DEVELOPMENT    │ TESTING          │ READY TO DEPLOY  ║
║ (2/5)             │ (1/5)            │                  ║
║ #5: Story C 🔒✅  │ #6: Story D ⚠️   │ #3: Story E ✅   ║
║ #4: Story F 🔒⏳  │                  │ #4: Story G ✅   ║
╠══════════════════════════════════════════════════════════╣
║ DONE                                                     ║
║ #1: Story H ✅  #2: Story I ✅                           ║
╚══════════════════════════════════════════════════════════╝

📊 METRICS
In Development: 2/5  |  Testing: 1/5  |  Blocked: 0

🚨 ALERTS
(нет блокировок)

Следующие действия:
→ /deploy staging  (2 задачи готовы к деплою)
→ /test #6         (ожидает тестирования)
```

## Легенда

| Символ | Значение |
|--------|---------|
| 🔒✅ | security:passed |
| 🔒❌ | security:failed |
| 🔒⏳ | security review в процессе |
| ✅ | qa:passed |
| ❌ | qa:failed |
| ⚠️ | требует внимания |
| 🚫 | blocked |
