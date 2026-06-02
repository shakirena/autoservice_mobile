# /refresh-agents — Синхронизация агентов

Синхронизирует агентов из проекта-источника или обновляет из AGENTS_FRAMEWORK.md.

## Использование

```
/refresh-agents
/refresh-agents from <path-to-source>
```

## Что делает

### Вариант 1: Обновить из текущего AGENTS_FRAMEWORK.md

Проверить актуальность всех агентов:

```bash
# Список агентов
ls .claude/agents/*.md

# Список команд
ls .claude/commands/*.md

# Проверить соответствие AGENTS_FRAMEWORK.md
echo "Agents в .claude/agents/:"
ls .claude/agents/*.md | xargs -I{} basename {} .md

echo ""
echo "Ожидается по AGENTS_FRAMEWORK.md:"
echo "Team Leads: analysis-lead, dev-lead, qa-lead, ops-lead"
echo "Workers: analyst, architect, developer, security-reviewer, tester, test-case-writer, e2e-tester, devops, doc-sync, integration-tester"
echo "Shared: quality-gates, dependency-resolver, kanban-board-sync"
```

### Вариант 2: Синхронизировать из другого проекта

```bash
SOURCE=$ARGUMENTS  # путь к source проекту

if [ -d "$SOURCE/.claude/agents" ]; then
  echo "Копирование агентов из $SOURCE"
  
  # Сравнить версии (по дате изменения)
  for AGENT in $(ls "$SOURCE/.claude/agents/*.md"); do
    AGENT_NAME=$(basename $AGENT)
    if [ -f ".claude/agents/$AGENT_NAME" ]; then
      echo "UPDATE: $AGENT_NAME"
    else
      echo "NEW: $AGENT_NAME"
    fi
  done
  
  echo ""
  echo "Для применения: cp $SOURCE/.claude/agents/*.md .claude/agents/"
  echo "⚠️ ВНИМАНИЕ: Это перезапишет все агенты!"
else
  echo "❌ Директория агентов не найдена: $SOURCE/.claude/agents"
fi
```

### Проверка целостности

```bash
echo "=== INTEGRITY CHECK ==="

# Проверить наличие всех обязательных агентов
REQUIRED="analysis-lead dev-lead qa-lead ops-lead analyst architect developer security-reviewer tester test-case-writer e2e-tester devops doc-sync"
SHARED="quality-gates dependency-resolver kanban-board-sync"

for AGENT in $REQUIRED $SHARED; do
  if [ -f ".claude/agents/$AGENT.md" ]; then
    echo "✅ $AGENT"
  else
    echo "❌ MISSING: $AGENT"
  fi
done

echo ""
echo "=== COMMANDS CHECK ==="
COMMANDS="feature analyze develop test deploy e2e kanban swarm sweep board pick setup-board init refresh-agents"
for CMD in $COMMANDS; do
  if [ -f ".claude/commands/$CMD.md" ]; then
    echo "✅ /$CMD"
  else
    echo "❌ MISSING: /$CMD"
  fi
done

echo ""
echo "=== MEMORY CHECK ==="
for MEM in "project-summary" "active-sprint" "decisions" "stories/_template"; do
  if [ -f ".claude/memory/$MEM.md" ]; then
    echo "✅ $MEM"
  else
    echo "❌ MISSING: $MEM"
  fi
done
```
