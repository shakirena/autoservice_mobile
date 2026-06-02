# /init — Полная инициализация агентной системы

Инициализирует агентную систему на проекте. Запускается один раз.

## Использование

```
/init
```

## Что делает

### 1. Проверить prerequisites

```bash
# GitHub CLI
gh auth status
gh auth refresh -s repo,project,read:org

# Git
git status
git remote -v

# Node / Expo
node --version
npm --version
npx expo --version

# EAS CLI (опционально)
eas --version 2>/dev/null || echo "EAS не установлен (опционально)"
```

### 2. Создать структуру директорий

```bash
mkdir -p docs/specs docs/arch docs/test-cases
mkdir -p e2e-tests/pages e2e-tests/tests e2e-tests/helpers
mkdir -p .claude/handoffs
```

### 3. Создать базовые документы

**docs/traceability.md:**
```markdown
# Traceability Matrix

| Feature | Story | Spec | Arch | Code | Unit Tests | TC Doc | E2E |
|---------|-------|------|------|------|------------|--------|-----|
```

**docs/test-cases/traceability-tc.md:**
```markdown
# Test Case Traceability Matrix

| Feature | Story | AC | TC | Unit Test | E2E |
|---------|-------|----|----|-----------|-----|
```

### 4. Обновить settings.json

Добавить разрешения в `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(git *)",
      "Bash(gh *)",
      "Bash(npm *)",
      "Bash(npx *)",
      "Bash(node *)",
      "Bash(eas *)",
      "Bash(grep *)",
      "Bash(find *)",
      "Bash(cat *)",
      "Bash(ls *)",
      "Bash(mkdir *)",
      "Bash(cp *)",
      "Bash(mv *)",
      "Bash(curl *)",
      "Bash(jq *)",
      "mcp__github__*"
    ],
    "deny": [
      "Bash(rm -rf /)",
      "Bash(git push --force)"
    ]
  }
}
```

### 5. Инициализировать Memory

Проверить что `.claude/memory/` содержит:
- `project-summary.md` ✅
- `active-sprint.md` ✅
- `decisions.md` ✅
- `stories/_template.md` ✅

### 6. Запустить /setup-board

```
/setup-board
```

### 7. Результат

```
✅ Инициализация завершена!

Структура:
  docs/specs/          ✅
  docs/arch/           ✅
  docs/test-cases/     ✅
  e2e-tests/           ✅
  .claude/agents/      ✅ (13 агентов)
  .claude/memory/      ✅
  .claude/commands/    ✅ (14 команд)

GitHub:
  Labels:    35 ✅
  Project:   #N ✅

Следующий шаг:
  /feature <описание первой фичи>
  или
  /kanban <описание> — полный pipeline
```
