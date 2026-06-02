# Quality Gates Protocol

Shared-протокол. Читается Team Leads напрямую. Не является агентом.

---

## Overview

| Gate | Переход | Enforcer | Verdict |
|------|---------|----------|---------|
| G1 | backlog → analysis | analysis-lead | PASS / NEEDS WORK / BLOCKED |
| G2 | analysis → ready-for-dev | analysis-lead | PASS / NEEDS WORK / BLOCKED |
| G3 | ready-for-dev → in-development | dev-lead | PASS / NEEDS WORK / BLOCKED |
| G4 | in-development → testing | dev-lead | PASS / NEEDS WORK / BLOCKED |
| G5 | testing → ready-to-deploy | qa-lead | PASS / NEEDS WORK / BLOCKED |
| G6 | ready-to-deploy → done | ops-lead | PASS / BLOCKED |

---

## Verdicts

| Verdict | Значение | Действие |
|---------|----------|----------|
| **PASS** ✅ | Все проверки выполнены | Переход в следующую колонку |
| **NEEDS WORK** ⚠️ | Мелкие проблемы, fixable inline | Fix + повтори gate |
| **BLOCKED** 🚫 | Критическая проблема | СТОП, issue остаётся, comment с деталями |

---

## Gate G1: backlog → analysis

**Enforcer:** analysis-lead  
**Цель:** Убедиться что issue понятен и готов к анализу

### Чеклист G1

```
[ ] Business value: чётко описана ценность для пользователя/бизнеса
[ ] Acceptance Criteria: минимум один AC присутствует
[ ] Нет дублей: поиск похожих issues (gh issue list --search "ключевые слова")
[ ] Тип выставлен: type:feature / type:bug / type:tech-debt / type:spike
[ ] Приоритет выставлен: priority:critical / high / medium / low
[ ] Описание достаточно: developer поймёт задачу без уточнений
```

### G1 Report Template

```markdown
## Quality Gate G1 Report ✅/⚠️/🚫

**Issue:** #N [название]  
**Дата:** [дата]  
**Enforcer:** analysis-lead

### Результат проверок
- Business value: ✅/❌ [комментарий]
- Acceptance Criteria: ✅/❌ [есть/нет/неполные]
- Дубликаты: ✅/❌ [найдено/не найдено: #X]
- Тип: ✅/❌ [type:X выставлен/не выставлен]
- Приоритет: ✅/❌ [priority:X выставлен/не выставлен]
- Описание: ✅/❌ [достаточно/нужно уточнение]

### Вердикт: PASS / NEEDS WORK / BLOCKED

[Если NEEDS WORK / BLOCKED — конкретные действия для исправления]
```

---

## Gate G2: analysis → ready-for-dev

**Enforcer:** analysis-lead  
**Цель:** Убедиться что spec и arch готовы для разработки

### Чеклист G2

```
Спецификация (analyst):
[ ] Spec создан: docs/specs/feature-{N}-{name}.md
[ ] FR (Functional Requirements) описаны
[ ] NFR (Non-Functional Requirements) описаны
[ ] Все stories имеют ровно ОДИН Given/When/Then (SD-1)
[ ] Нет size:xl stories (SD-3)
[ ] Нет " и " / " and " в title stories (SD-5)
[ ] Нет "and also" / двух Given-блоков в AC (SD-5)
[ ] Все stories INVEST-valid (SD-2)
[ ] Шаблон SD-4 соблюдён (User Story + G/W/T + Вне Scope + Technical Notes)

Архитектура (architect):
[ ] Arch doc создан: docs/arch/feature-{N}-{name}.md
[ ] ERD (data model) описан
[ ] API contracts / Firebase структура определены
[ ] ADR (Architecture Decision Record) присутствует
[ ] Code stubs созданы

Memory:
[ ] .claude/memory/stories/story-{N}.md создан с разделами 📋 и 🏗️
```

### G2 Report Template

```markdown
## Quality Gate G2 Report ✅/⚠️/🚫

**Feature:** #N [название]  
**Дата:** [дата]  
**Enforcer:** analysis-lead

### Spec (analyst)
- FR: ✅/❌
- NFR: ✅/❌
- Stories count: [N] stories
- SD-1 (один G/W/T): ✅/❌ [story #X нарушает]
- SD-3 (нет xl): ✅/❌
- SD-5 (нет "и"/"and"): ✅/❌
- INVEST: ✅/❌

### Arch (architect)
- Arch doc: ✅/❌
- ERD: ✅/❌
- API contracts: ✅/❌
- ADR: ✅/❌
- Stubs: ✅/❌ [N файлов]

### Memory
- story-{N}.md: ✅/❌

### Вердикт: PASS / NEEDS WORK / BLOCKED
```

---

## Gate G3: ready-for-dev → in-development

**Enforcer:** dev-lead  
**Цель:** Убедиться что developer готов стартовать

### Чеклист G3

```
[ ] Build OK: npm run build / npx tsc --noEmit (реальный вывод)
[ ] WIP < 5: количество in-development issues
[ ] Dependencies: нет open blockers (Blocked by / Depends on)
[ ] AC testable: каждый AC имеет ровно один G/W/T
[ ] story-{N}.md: разделы 📋 и 🏗️ заполнены (для developer context)
```

### G3 Report Template

```markdown
## Quality Gate G3 Report ✅/🚫

**Story:** #N [название]  
**Дата:** [дата]  
**Enforcer:** dev-lead

### Checks
- Build: ✅/❌
  ```
  [вывод команды]
  ```
- WIP: [X]/5 issues in-development
- Dependencies: ✅ нет блокеров / 🚫 заблокирован #X (open)
- AC testable: ✅/❌

### Вердикт: PASS / BLOCKED
```

---

## Gate G4: in-development → testing (code review)

**Enforcer:** dev-lead  
**Цель:** Убедиться что код готов к security review и тестированию

### Чеклист G4

```
[ ] Build OK: npx tsc --noEmit && npm test (реальный вывод)
[ ] Lint OK: нет критических ошибок
[ ] Unit tests написаны для service layer
[ ] Все тесты GREEN
[ ] Нет orphaned файлов (файлы без использования)
[ ] Нет TODO/FIXME в новом коде
[ ] Developer оставил comment с полным списком изменённых файлов
[ ] Commit message соответствует формату feat(#{N}): описание
[ ] story-{N}.md раздел 💻 заполнен
```

### G4 Report Template

```markdown
## Quality Gate G4 Report ✅/⚠️/🚫

**Story:** #N [название]  
**Branch:** feature/{N}-{name}  
**Дата:** [дата]  
**Enforcer:** dev-lead

### Checks
- TypeScript: ✅/❌
  ```
  [вывод tsc --noEmit]
  ```
- Tests: ✅/❌ [N passed, M failed]
  ```
  [вывод npm test]
  ```
- No TODO/FIXME: ✅/❌
- Developer comment: ✅/❌
- story-{N}.md раздел 💻: ✅/❌

### Изменённые файлы (из developer comment)
[список]

### Вердикт: PASS / NEEDS WORK / BLOCKED

[Если NEEDS WORK — конкретные исправления]
```

---

## Gate G5: testing → ready-to-deploy

**Enforcer:** qa-lead  
**Цель:** Убедиться что QA пройден полностью

### Чеклист G5

```
ОБЯЗАТЕЛЬНЫЕ предусловия:
[ ] security:passed label ПРИСУТСТВУЕТ (без этого — BLOCKED немедленно)
[ ] developer comment с файлами есть

Coverage:
[ ] Coverage ≥ 95% новых файлов (hotfix: ≥ 50%)
[ ] Реальный coverage report (не утверждение)

Tests:
[ ] Все unit tests GREEN
[ ] Execution time < 2 мин

TC Documentation:
[ ] TC doc создан: docs/test-cases/feature-{N}-{name}.md
[ ] Каждый AC покрыт: happy path + error case + RBAC
[ ] traceability-tc.md обновлён

Labels:
[ ] qa:passed выставлен (не qa:in-progress)
[ ] security:passed НЕ тронут (qa-lead не трогает security:* labels)
```

### G5 Report Template

```markdown
## Quality Gate G5 Report ✅/⚠️/🚫

**Story:** #N [название]  
**Дата:** [дата]  
**Enforcer:** qa-lead

### Pre-conditions
- security:passed: ✅ ПРИСУТСТВУЕТ / 🚫 ОТСУТСТВУЕТ → BLOCKED

### Coverage (реальный отчёт)
```
[вывод jest --coverage]
```
- Новые файлы: [X]%
- Порог: 95% / 50% (hotfix)
- Результат: ✅/❌

### Tests
- Passed: [N]
- Failed: [M]
- Time: [X]s

### TC Documentation
- TC doc: ✅/❌
- AC покрыты: [N]/[N]
- Traceability: ✅/❌

### Вердикт: PASS / NEEDS WORK / BLOCKED
```

---

## Gate G6: ready-to-deploy → done

**Enforcer:** ops-lead  
**Цель:** Убедиться что деплой прошёл успешно

### Чеклист G6 Pre-deploy

```
[ ] kanban:ready-to-deploy label есть
[ ] qa:passed label есть
[ ] security:passed label есть
[ ] Build проходит: npm run build (реальный вывод)
[ ] Rollback команда задокументирована
```

### Чеклист G6 Post-deploy

```
[ ] Build артефакт создан (EAS build ID или OTA update ID)
[ ] Deploy успешен (статус от EAS)
[ ] Health check: ✅
[ ] Smoke test: ✅
[ ] Logs clean (нет ERROR/WARN в первые 60s)
```

### G6 Report Template

```markdown
## Quality Gate G6 Report ✅/🚫

**Feature:** #N [название]  
**Deploy target:** staging / production  
**Дата:** [дата]  
**Enforcer:** ops-lead

### Pre-deploy
- Labels: qa:passed ✅, security:passed ✅
- Build: ✅/❌
  ```
  [вывод]
  ```

### Deploy
- Type: EAS Build / OTA Update
- ID: [build/update ID]
- Status: ✅ Success / ❌ Failed

### Post-deploy
- Health: ✅/❌
- Smoke test: ✅/❌
- Logs: ✅ clean / ❌ [ошибки]

### Rollback
```bash
[rollback команда]
```

### Вердикт: PASS / BLOCKED (ROLLBACK REQUIRED)
```

---

## Hotfix Exceptions

| Gate | Hotfix |
|------|--------|
| G1 | ПРОПУСКАЕТСЯ |
| G2 | ПРОПУСКАЕТСЯ |
| G3 | Обязателен |
| G4 | Обязателен |
| G5 | Обязателен, coverage ≥ 50% (не 95%) |
| G6 | Обязателен |

**Условие hotfix:** `type:hotfix` + `priority:critical` + `kanban:ready-for-dev` (выставлен вручную).
