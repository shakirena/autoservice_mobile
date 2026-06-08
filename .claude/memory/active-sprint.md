# Active Sprint

_Текущий WIP. Обновляют Team Leads (не рабочие агенты)._

---

## In Development (WIP: 0/5)

_Пусто — нет активных задач_

## In Testing (WIP: 0/5)

_Пусто — нет активных задач_

## Ready to Deploy

- #2: Story: Ввод номера телефона в формате +994 на экране входа — frontend — G5 PASS, qa:passed, security:passed
  - Branch: feature/2-3-4-azerbaijan-phone-format @ 929ef70 (+ docs c5691a7)
  - Coverage: 100% (phoneFormats.js, phoneUtils.js — node --test --experimental-test-coverage)
- #3: Story: Валидация азербайджанского номера перед отправкой кода — frontend — G5 PASS, qa:passed, security:passed
  - Branch: feature/2-3-4-azerbaijan-phone-format @ 929ef70 (+ docs c5691a7)
  - Coverage: 100% (phoneFormats.js, phoneUtils.js)
- #4: Story: Нормализация и сохранение номеров с кодом +994 в Firestore — backend — G5 PASS, qa:passed, security:passed
  - Branch: feature/2-3-4-azerbaijan-phone-format @ 929ef70 (+ docs c5691a7)
  - Coverage: 100% (phoneUtils.js — normalizePhone/formatPhoneDisplay)

_Все три story реализованы вместе в одном branch (one feature, one branch — общий контракт_
_COUNTRY_PHONE_FORMATS, ADR-004; затрагивают одни и те же файлы LoginScreen.js / firestore.js)._
_Build: ✅ (expo export --platform web). Unit tests: 37/37 GREEN (21 developer + 16 tester,_
_node --test, ~0.4s). TC doc: docs/test-cases/feature-1-azerbaijan-phone-format.md (TC-2-001..006,_
_TC-3-001..006, TC-4-001..005). Traceability обновлена (docs/traceability.md, traceability-tc.md)._
_Spec: docs/specs/feature-1-azerbaijan-phone-format.md · Arch: docs/arch/feature-1-azerbaijan-phone-format.md_

## Recently Done

_Пусто_

---

## Sprint Metrics

| Метрика | Значение |
|---------|---------|
| Дата начала | 2026-06-08 |
| In Development | 0/5 |
| In Testing | 0/5 |
| Ready to Deploy | 3 |
| Blocked | 0 |
| Done this sprint | 0 |

---

_Формат записи:_
```
## In Development (WIP: N/5)
- #[N]: [Story title] — [developer] — started [дата]
  - Branch: feature/{N}-{name}
  - Security: pending/passed/failed
```
