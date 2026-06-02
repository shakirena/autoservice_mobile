# Dependency Resolver Protocol

Shared-протокол для обработки DAG-зависимостей между stories/issues. Читается Team Leads перед запуском агентов.

---

## Синтаксис зависимостей (в body issue)

```
Blocked by: #10, #12
Depends on: #10
Requires: #10, #12, #15
```

Все три формы эквивалентны — issue не может быть обработан пока blockers не resolved.

---

## Алгоритм проверки зависимостей

### Шаг 1: Получить blockers

```bash
# Получить body issue
gh issue view #N --json body | jq -r '.body'

# Извлечь номера blockers (grep)
gh issue view #N --json body | jq -r '.body' | \
  grep -Ei "(blocked by|depends on|requires):" | \
  grep -oE "#[0-9]+" | tr -d '#'
```

### Шаг 2: Проверить статус каждого blocker

```bash
# Для каждого blocker #X:
gh issue view #X --json state,labels | jq '{
  state: .state,
  kanban: [.labels[].name | select(startswith("kanban:"))]
}'
```

### Шаг 3: Принять решение

| Состояние blocker | Действие |
|-------------------|----------|
| `state: closed` ИЛИ `kanban:done` | ✅ Не блокирует — обрабатывать |
| `state: open` И НЕ `kanban:done` | 🚫 BLOCKED — skip issue |
| Circular dependency (A→B→A) | 🚫 Manual intervention — нельзя авторазрешить |
| Depth > 10 уровней | 🚫 BLOCKED — предупредить человека |

---

## Circular Dependency Detection

```bash
# Простая проверка: если #A blocked by #B, и #B blocked by #A
BLOCKER_OF_N=$(gh issue view #N --json body | jq -r '.body' | grep -oE "#[0-9]+")
for BLOCKER in $BLOCKER_OF_N; do
  BLOCKER_NUM=${BLOCKER#\#}
  BLOCKER_OF_BLOCKER=$(gh issue view #$BLOCKER_NUM --json body | jq -r '.body' | grep -oE "#[0-9]+")
  if echo "$BLOCKER_OF_BLOCKER" | grep -q "#$N"; then
    echo "CIRCULAR: #$N <-> #$BLOCKER_NUM"
  fi
done
```

При обнаружении circular dependency → BLOCKED, требуй вмешательства человека.

---

## Действия при BLOCKED

### Comment в issue

```markdown
## ⛔ BLOCKED: Dependency Not Resolved

**Issue:** #N  
**Blocked by:** #X, #Y

### Статус blockers
| Blocker | Статус | Kanban |
|---------|--------|--------|
| #X | open | kanban:in-development |
| #Y | closed | kanban:done ✅ |

### Следующий шаг
Issue #X должен достичь `kanban:done` перед тем как #N можно обработать.

**Для разблокировки:** `/develop #X` → `/test #X` → `/deploy staging`
```

### Добавить label

```bash
gh issue edit #N --add-label "blocked"
```

---

## Dependency-aware dispatch

### /develop #3 #4 #5 — порядок выполнения

dev-lead определяет порядок через dependency graph:

```bash
# Построить порядок (топологическая сортировка)
for ISSUE in 3 4 5; do
  BLOCKERS=$(gh issue view #$ISSUE --json body | jq -r '.body' | \
    grep -oE "#[0-9]+" | tr -d '#')
  echo "#$ISSUE depends on: $BLOCKERS"
done

# Пример результата:
# #3 depends on: (нет) → запустить первым
# #4 depends on: 3 → ждать #3
# #5 depends on: (нет) → параллельно с #3
```

**Правило параллелизма:**
- Issues без взаимных зависимостей → запускать параллельно
- Issue X зависит от Y → сначала Y, потом X

---

## analyst — добавление зависимостей

При декомпозиции фичи analyst обязан добавить зависимости если:
- Story B использует данные, создаваемые Story A (Entity → Service → API)
- Story B требует UI компонент из Story A
- Story B невозможна без завершения Story A

```bash
# При создании зависимой story
gh issue create \
  --title "Story: [название]" \
  --body "## User Story
...

## Dependencies
Blocked by: #[parent story number]"
```

---

## /board — визуализация blocked issues

```bash
# Все blocked issues
gh issue list --label "blocked" --json number,title,labels | \
  jq '.[] | "🚫 #\(.number): \(.title)"'

# Issues в in-development с возможными blockers
gh issue list --label "kanban:in-development" --json number,title,body | \
  jq '.[] | select(.body | test("(blocked by|depends on|requires):\\s*#"; "i")) | 
  "#\(.number): \(.title)"'
```
