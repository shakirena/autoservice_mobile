# Kanban Board Sync Protocol

Shared-протокол для синхронизации GitHub Labels + Project Board. Обязательно для всех Team Leads при каждой смене колонки.

---

## Двойная синхронизация (ОБЯЗАТЕЛЬНО)

**Порядок: СНАЧАЛА статус → ПОТОМ работа.**

При каждой смене колонки:
1. **Labels** — убрать старый `kanban:*`, добавить новый
2. **Project Board Status** — обновить через `gh project item-edit`

---

## Шаблоны команд

### 1. Смена Label

```bash
# Убрать старый kanban label, добавить новый
gh issue edit #N \
  --remove-label "kanban:СТАРЫЙ" \
  --add-label "kanban:НОВЫЙ"

# Примеры переходов:
gh issue edit #N --remove-label "kanban:backlog" --add-label "kanban:analysis"
gh issue edit #N --remove-label "kanban:analysis" --add-label "kanban:ready-for-dev"
gh issue edit #N --remove-label "kanban:ready-for-dev" --add-label "kanban:in-development"
gh issue edit #N --remove-label "kanban:in-development" --add-label "kanban:testing"
gh issue edit #N --remove-label "kanban:testing" --add-label "kanban:ready-to-deploy"
gh issue edit #N --remove-label "kanban:ready-to-deploy" --add-label "kanban:done"
```

### 2. Получить Project ID и Item ID

```bash
# Получить список проектов организации/пользователя
gh project list --owner @me --format json | jq '.projects[] | {number: .number, title: .title}'

# Получить item ID для issue в проекте (замени PROJECT_NUMBER)
PROJECT_NUMBER=1
gh project item-list $PROJECT_NUMBER --owner @me --format json | \
  jq --arg issue "#N" '.items[] | select(.content.number == ($issue | ltrimstr("#") | tonumber)) | {id: .id, title: .content.title}'
```

### 3. Обновить статус в Project Board

```bash
# Получить field ID для статуса (один раз, сохранить)
PROJECT_NUMBER=1
gh project field-list $PROJECT_NUMBER --owner @me --format json | \
  jq '.fields[] | select(.name == "Status") | {id: .id, options: .options}'

# Обновить статус item
# ITEM_ID — из шага 2, FIELD_ID и OPTION_ID — из field-list выше
gh project item-edit \
  --project-id $PROJECT_NUMBER \
  --id ITEM_ID \
  --field-id FIELD_ID \
  --single-select-option-id OPTION_ID

# Если GraphQL нужен напрямую:
gh api graphql -f query='
mutation {
  updateProjectV2ItemFieldValue(input: {
    projectId: "PROJECT_ID"
    itemId: "ITEM_ID"
    fieldId: "STATUS_FIELD_ID"
    value: {
      singleSelectOptionId: "OPTION_ID"
    }
  }) {
    projectV2Item {
      id
    }
  }
}'
```

---

## Маппинг: Kanban Label → Project Board Status

| Label | Project Board Status |
|-------|---------------------|
| `kanban:backlog` | Backlog |
| `kanban:analysis` | Analysis |
| `kanban:ready-for-dev` | Ready for Dev |
| `kanban:in-development` | In Development |
| `kanban:testing` | Testing |
| `kanban:ready-to-deploy` | Ready to Deploy |
| `kanban:done` | Done |

---

## Fallback: если Project Board недоступен

Если `gh project` команды не работают (нет проекта или нет доступа):
1. Обновить только Labels (основной механизм)
2. Логировать что board sync пропущен
3. **НЕ прерывать** основной workflow

```bash
# Проверить доступность project
gh project list --owner @me 2>&1 | head -5
```

---

## Быстрые макросы для Team Leads

### analysis-lead

```bash
# backlog → analysis
sync_to_analysis() {
  gh issue edit #$1 --remove-label "kanban:backlog" --add-label "kanban:analysis"
}

# analysis → ready-for-dev
sync_to_ready() {
  gh issue edit #$1 --remove-label "kanban:analysis" --add-label "kanban:ready-for-dev"
}
```

### dev-lead

```bash
# ready-for-dev → in-development
sync_to_dev() {
  gh issue edit #$1 --remove-label "kanban:ready-for-dev" --add-label "kanban:in-development"
}

# in-development → testing (ТОЛЬКО после security:passed)
sync_to_testing() {
  gh issue edit #$1 --remove-label "kanban:in-development" --add-label "kanban:testing"
}
```

### qa-lead

```bash
# testing → ready-to-deploy (PASS)
sync_to_deploy() {
  gh issue edit #$1 \
    --remove-label "kanban:testing,qa:in-progress" \
    --add-label "kanban:ready-to-deploy,qa:passed"
}

# testing → in-development (FAIL)
sync_back_to_dev() {
  gh issue edit #$1 \
    --remove-label "kanban:testing,qa:in-progress" \
    --add-label "kanban:in-development,qa:failed"
}
```

### ops-lead

```bash
# ready-to-deploy → done
sync_to_done() {
  gh issue edit #$1 \
    --remove-label "kanban:ready-to-deploy" \
    --add-label "kanban:done,deployed:staging"
  gh issue close #$1 --comment "✅ Deployed to staging successfully."
}
```

---

## /board: отображение доски

```bash
echo "=== KANBAN BOARD ==="

for COLUMN in "kanban:backlog" "kanban:analysis" "kanban:ready-for-dev" "kanban:in-development" "kanban:testing" "kanban:ready-to-deploy" "kanban:done"; do
  LABEL_NAME=$(echo $COLUMN | sed 's/kanban://')
  echo ""
  echo "### ${LABEL_NAME^^} ###"
  gh issue list --label "$COLUMN" --json number,title,labels --limit 20 | \
    jq -r '.[] | "  #\(.number): \(.title) [\(.labels | map(.name) | join(", "))]"'
done

echo ""
echo "=== WIP METRICS ==="
IN_DEV=$(gh issue list --label "kanban:in-development" --json number | jq length)
IN_TEST=$(gh issue list --label "kanban:testing" --json number | jq length)
echo "In Development: $IN_DEV/5"
echo "Testing: $IN_TEST/5"
BLOCKED=$(gh issue list --label "blocked" --json number | jq length)
echo "Blocked: $BLOCKED"
```
