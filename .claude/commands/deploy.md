# /deploy — Deploy Phase

Запускает ops-lead для деплоя. Gate: G6.

## Использование

```
/deploy staging
/deploy production
/deploy all
```

## Что делает

Запускает агента **ops-lead** с указанным окружением.

ops-lead выполняет Deploy Flow:
1. G6 Pre-flight: `qa:passed` + `security:passed` + build OK
2. **devops**: pre-deploy tests → EAS build/OTA → health check → smoke test → logs
3. G6 Post-deploy: health OK, smoke OK, logs clean
4. Staging: автоматически → `kanban:done` + `deployed:staging`
5. Production: подготовить checklist → **ЖДАТЬ** `APPROVE PRODUCTION DEPLOY`

## Staging vs Production

| | Staging | Production |
|---|---------|------------|
| Метод | OTA update или EAS preview | EAS production build |
| Одобрение | Автоматически | **Требует `APPROVE PRODUCTION DEPLOY`** |
| Label | `deployed:staging` | `deployed:production` |

## Аргументы

`$ARGUMENTS`:
- `staging` — деплой на staging
- `production` — деплой на production (требует одобрения)
- `all` — все `kanban:ready-to-deploy` issues на staging
