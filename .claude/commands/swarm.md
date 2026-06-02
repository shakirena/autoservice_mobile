# /swarm — Параллельная обработка всей доски

Запускает всех Team Leads параллельно по всей Kanban-доске. Максимальная скорость.

## Использование

```
/swarm
/swarm develop    (только dev phase)
/swarm test       (только test phase)
/swarm analyze    (только analysis phase)
/swarm dry-run    (показать план без выполнения)
```

## Что делает

Запускает всех Team Leads ПАРАЛЛЕЛЬНО:

```
[ПАРАЛЛЕЛЬНО]
├── ops-lead    → deploy все ready-to-deploy
├── qa-lead     → test все в testing
├── dev-lead    → develop все ready-for-dev
└── analysis-lead → analyze все в backlog/analysis
```

## dry-run

```
/swarm dry-run
```

Показывает план без выполнения:
```
=== SWARM DRY RUN ===
Ready to Deploy (#3, #4) → ops-lead будет деплоить
Testing (#5, #6) → qa-lead будет тестировать  
Ready for Dev (#7, #8) → dev-lead будет разрабатывать
Backlog (#9) → analysis-lead будет анализировать

WIP check: Dev 2/5 ✅, Test 2/5 ✅
Blocked: #10 (depends on #7)

Для запуска: /swarm
```

## Предупреждения

- **Race conditions**: возможны при параллельном обновлении labels одной story
- **Используй /sweep** для безопасной обработки (right-to-left, без race conditions)
- WIP limits проверяются каждым Team Lead независимо

## Аргументы

`$ARGUMENTS`:
- пусто — все фазы параллельно
- `develop` / `test` / `analyze` — только указанная фаза
- `dry-run` — только план
