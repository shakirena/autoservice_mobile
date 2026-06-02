# /feature — Создать Feature Request

Создаёт GitHub Issue для новой фичи с AC, приоритетом и размером.

## Использование

```
/feature <описание фичи>
```

## Что делает

Запусти агента **analyst** с задачей создать Feature Issue:

### 1. Собрать информацию

Проанализируй описание: `$ARGUMENTS`

Определи:
- **Тип:** feature / bug / tech-debt / spike
- **Компонент:** backend / frontend / ai / infra / docs
- **Приоритет:** critical / high / medium / low (по умолчанию medium)
- **Размер:** xs (<2ч) / s (полдня) / m (1-2 дня) / l (3-5 дней)

### 2. Создать Issue

```bash
gh issue create \
  --title "[Feature]: [название из описания]" \
  --body "## Description
[развёрнутое описание фичи]

## Problem Statement
[какую проблему решает]

## Proposed Solution
[предлагаемое решение]

## Acceptance Criteria
- [ ] AC-1: [критерий приёмки]
- [ ] AC-2: [критерий приёмки]

## Out of Scope
- [что не входит в эту фичу]

## Technical Notes
[технические детали, ограничения, зависимости]" \
  --label "type:feature,kanban:backlog,priority:[LEVEL],component:[TYPE]"
```

### 3. Вывести результат

```
✅ Feature Issue создан: #N [название]
   Labels: type:feature, kanban:backlog, priority:[X], component:[X]
   
Следующий шаг: /analyze #N
```

## Примеры

```
/feature Добавить экран истории визитов в автосервис
/feature Авторизация через Google OAuth
/feature Исправить краш при открытии профиля
```
