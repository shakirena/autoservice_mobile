# /sweep — Right-to-Left Автопилот

Последовательная обработка доски справа налево: deploy → test → dev → analysis. Безопасный автопилот без race conditions.

## Использование

```
/sweep
/sweep staging     (только staging deploy)
/sweep dry-run     (показать план без выполнения)
```

## Порядок выполнения (right-to-left)

```
1. ops-lead:      деплоить все kanban:ready-to-deploy
        ↓ (ждать завершения)
2. qa-lead:       тестировать все kanban:testing
        ↓ (ждать завершения)
3. dev-lead:      разрабатывать все kanban:ready-for-dev
        ↓ (ждать завершения)
4. analysis-lead: анализировать все kanban:backlog
```

## Почему right-to-left?

Сначала продвигаем задачи, которые дальше всего в pipeline:
- Освобождаем место в WIP (done ← ready-to-deploy)
- Затем заполняем freed slots (ready-to-deploy ← testing)
- И т.д.

Это предотвращает WIP overflow и гарантирует прогресс.

## dry-run

```
/sweep dry-run
```

Выводит план:
```
=== SWEEP PLAN (right-to-left) ===

STEP 1: Deploy (ops-lead)
  → #3: [Story title] (ready-to-deploy, qa:passed, security:passed ✅)
  → #4: [Story title] (ready-to-deploy, qa:passed ✅, security:passed ✅)

STEP 2: Test (qa-lead)  
  → #5: [Story title] (testing, security:passed ✅)
  → #6: [Story title] (testing, security:passed ⚠️ MISSING → BLOCKED)

STEP 3: Develop (dev-lead)
  → #7: [Story title] (ready-for-dev, WIP: 2/5)
  → #8: [Story title] (ready-for-dev, BLOCKED by #7)

STEP 4: Analyze (analysis-lead)
  → #9: [Story title] (backlog)

Для запуска: /sweep
```

## Отличие от /swarm

| | /sweep | /swarm |
|---|--------|--------|
| Порядок | Right-to-left, последовательно | Все параллельно |
| Race conditions | Минимальны | Возможны |
| Скорость | Медленнее | Быстрее |
| Безопасность | Высокая | Средняя |
| Когда | Обычная работа | Нужна max скорость |

## Аргументы

`$ARGUMENTS`:
- пусто — все фазы right-to-left
- `staging` — только deploy staging
- `dry-run` — только план
