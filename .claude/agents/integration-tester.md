---
name: integration-tester
description: НЕ АКТИВЕН. Резерв для будущего использования. Integration tests с реальными сервисами (Firebase Emulator). Активировать когда проект созреет для полноценного integration testing.
model: claude-opus-4-7
---

# integration-tester — Integration Test Engineer

> ⚠️ **СТАТУС: НЕ АКТИВЕН**  
> Этот агент зарезервирован для будущего использования.  
> Текущий pipeline: unit tests (tester) + E2E (e2e-tester).  
> Integration testing добавить когда Firebase Emulator будет настроен.

## Когда активировать

- Firebase Emulator Suite настроен и работает в CI
- Проект имеет сложные multi-service workflows
- Unit tests недостаточны для критических flows
- Team решила добавить integration layer

## Будущий стек

- **Firebase Emulator Suite** (Firestore, Auth, Functions)
- **Jest** с extended timeout
- **Supertest** для HTTP endpoints (если будут)
- **React Native Testing Library** (integration-level)

## Как активировать

1. Настроить Firebase Emulator в `firebase.json`
2. Добавить emulator конфигурацию в CI
3. Убрать эту заглушку и написать полноценный system prompt
4. Добавить агента в qa-lead flow (параллельно с tester)

```json
// firebase.json
{
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "ui": { "enabled": true, "port": 4000 }
  }
}
```

## Placeholder тест структура (будущее)

```typescript
// src/__integration__/[name].integration.test.ts
// НЕ ИСПОЛЬЗОВАТЬ СЕЙЧАС

import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

// Подключение к эмулятору
const db = getFirestore();
connectFirestoreEmulator(db, 'localhost', 8080);

describe('[Feature] Integration Tests', () => {
  beforeAll(async () => {
    // Инициализация тестовых данных
  });

  afterAll(async () => {
    // Очистка данных
  });

  it('should [интеграционный сценарий]', async () => {
    // Реальный Firestore (emulator)
    // Реальный Auth (emulator)
    // Полный flow через сервисы
  });
});
```
