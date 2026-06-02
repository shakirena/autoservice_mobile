# /setup-board — Инициализация GitHub Labels и Project Board

Создаёт 35 GitHub-меток и настраивает Project Board. Запускается один раз.

## Использование

```
/setup-board
```

## Что делает

### 1. Создать GitHub Labels

```bash
# === KANBAN COLUMNS ===
gh label create "kanban:backlog"          --color "0e8a16" --description "Backlog"
gh label create "kanban:analysis"         --color "0075ca" --description "In Analysis"
gh label create "kanban:ready-for-dev"    --color "6f42c1" --description "Ready for Development"
gh label create "kanban:in-development"   --color "e4e669" --description "In Development"
gh label create "kanban:testing"          --color "e99695" --description "In Testing"
gh label create "kanban:ready-to-deploy"  --color "f9d0c4" --description "Ready to Deploy"
gh label create "kanban:done"             --color "1a7f37" --description "Done"

# === TYPES ===
gh label create "type:feature"    --color "84b6eb" --description "Feature Request"
gh label create "type:epic"       --color "3e4b9e" --description "Epic"
gh label create "type:story"      --color "bfd4f2" --description "User Story"
gh label create "type:bug"        --color "d73a4a" --description "Bug Report"
gh label create "type:tech-debt"  --color "cfd3d7" --description "Technical Debt"
gh label create "type:hotfix"     --color "b60205" --description "Hotfix (skip G1/G2)"
gh label create "type:spike"      --color "e4e669" --description "Research Spike"

# === PRIORITIES ===
gh label create "priority:critical" --color "b60205" --description "P0: Critical"
gh label create "priority:high"     --color "d93f0b" --description "P1: High"
gh label create "priority:medium"   --color "fbca04" --description "P2: Medium"
gh label create "priority:low"      --color "0e8a16" --description "P3: Low"

# === SIZES ===
gh label create "size:xs" --color "c5def5" --description "< 2 hours"
gh label create "size:s"  --color "bfd4f2" --description "Half day"
gh label create "size:m"  --color "84b6eb" --description "1-2 days"
gh label create "size:l"  --color "0075ca" --description "3-5 days"

# === COMPONENTS ===
gh label create "component:backend"  --color "f9d0c4" --description "Backend"
gh label create "component:frontend" --color "fef2c0" --description "Frontend / UI"
gh label create "component:ai"       --color "d4c5f9" --description "AI / ML"
gh label create "component:infra"    --color "e4e669" --description "Infrastructure"
gh label create "component:docs"     --color "cfd3d7" --description "Documentation"

# === QA STATUS ===
gh label create "qa:in-progress" --color "fef2c0" --description "QA in Progress"
gh label create "qa:passed"      --color "0e8a16" --description "QA Passed (95% coverage)"
gh label create "qa:failed"      --color "d73a4a" --description "QA Failed"

# === SECURITY STATUS ===
gh label create "security:passed" --color "0e8a16" --description "Security Review Passed"
gh label create "security:failed" --color "b60205" --description "Security Review Failed"

# === DEPLOY STATUS ===
gh label create "deployed:staging"    --color "c2e0c6" --description "Deployed to Staging"
gh label create "deployed:production" --color "1a7f37" --description "Deployed to Production"

# === OTHER ===
gh label create "blocked" --color "b60205" --description "Blocked by dependency"
```

### 2. Создать GitHub Project Board

```bash
# Создать новый проект
gh project create --owner @me --title "autoservice-mobile Kanban"

# Получить номер проекта
gh project list --owner @me --format json | jq '.projects[] | select(.title == "autoservice-mobile Kanban") | .number'

# Добавить колонки Status (замени PROJECT_NUMBER)
PROJECT_NUMBER=1
echo "Project #$PROJECT_NUMBER создан"
echo "Добавь колонки вручную через GitHub UI или gh project field-create:"
echo "  Backlog | Analysis | Ready for Dev | In Development | Testing | Ready to Deploy | Done"
```

### 3. Результат

```
✅ Создано 35 labels
✅ Project Board создан: #N

Следующие шаги:
1. Настрой колонки Project Board в GitHub UI
2. /init — полная инициализация системы
3. /feature <описание> — первая фича
```
