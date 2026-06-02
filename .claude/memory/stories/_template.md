# Story #N: [Название]

_Шаблон. Каждый агент дописывает свой раздел — НЕ перезаписывает чужие._

---

## 📋 Задача (analyst)

**Feature:** #[parent issue]  
**Priority:** critical/high/medium/low  
**Size:** xs/s/m/l  
**Component:** backend/frontend/ai/infra/docs  

### User Story
As a [роль], I want to [действие], so that [ценность].

### AC (Given/When/Then)
Given [начальное условие]  
When [действие пользователя]  
Then [ожидаемый результат]  

### Вне Scope
- [что НЕ входит]

### Dependencies
Blocked by: #X / нет зависимостей

### Spec
`docs/specs/feature-{N}-{name}.md`

---

## 🏗️ Архитектура (architect)

**Arch Doc:** `docs/arch/feature-{N}-{name}.md`

### Ключевые решения
- [Решение]: [объяснение]

### Data Model
```
Entity: [Название]
Fields: id, [field], createdAt, updatedAt
```

### API / Firebase
- Collection: `[collection name]`
- Methods: getById, create, update, delete

### Stubs созданы
- `src/types/[name].types.ts`
- `src/services/[name]Service.ts`
- `src/screens/[Name]Screen.tsx`

---

## 💻 Реализация (developer)

**Branch:** `feature/{N}-{short-name}`

### Реализованные файлы
- `src/types/[name].types.ts`
- `src/services/[name]Service.ts`
- `src/hooks/use[Name].ts`
- `src/screens/[Name]Screen.tsx`

### Тесты (service layer)
- `src/services/__tests__/[name]Service.test.ts`
- Покрытие: [X]%

### Build Status
- TypeScript: ✅/❌
- Tests: ✅/❌
- Expo export: ✅/❌

---

## 🔒 Security Review (security-reviewer)

**Статус:** PASSED ✅ / FAILED ❌  
**Цикл:** 1/2/3

### Проверено
- OWASP A01 Access Control: ✅/❌
- OWASP A02 Cryptographic: ✅/❌
- Firebase Security Rules: ✅/❌
- Auth handling: ✅/❌

### Находки
[CRITICAL/HIGH если FAIL, или "Критических уязвимостей не найдено"]

---

## ✅ QA (qa-lead)

**TC Doc:** `docs/test-cases/feature-{N}-{name}.md`

### Unit Tests (tester)
- Coverage: [X]%
- Tests: [N] passed, [M] failed
- Time: [X]s

### Test Cases (test-case-writer)
- TC созданы: [N] кейсов
- AC покрыты: [N]/[N]
- Приоритеты: Critical:[N], High:[N], Medium:[N]

### QA Result
qa:passed / qa:failed
