# Architectural Decisions

_Кросс-story архитектурные решения. Дописывают architect и developer._  
_Только решения, влияющие на 2+ stories._

---

## ADR-001: Firebase Firestore как основная база данных

**Дата:** 2026-05-24  
**Статус:** Accepted  
**Влияет на:** все stories с данными

**Решение:** Использовать Firebase Firestore (NoSQL) для хранения данных.

**Причина:**
- Expo managed workflow хорошо интегрируется с Firebase
- Реалтайм синхронизация из коробки
- Firebase Auth + Firestore Security Rules = RBAC без сервера
- Нет необходимости в отдельном backend сервере

**Последствия:**
- Все сервисы используют `firebase/firestore` v9+ модульный API
- Data model — документы в коллекциях (не реляционная БД)
- Security Rules — основной механизм авторизации на уровне данных

---

## ADR-002: React Navigation v7 Native Stack

**Дата:** 2026-05-24  
**Статус:** Accepted  
**Влияет на:** все stories с навигацией

**Решение:** React Navigation v7 с native-stack.

**Причина:** Нативная производительность, поддержка Expo 56.

**Последствия:**
- `useNavigation()` в screen компонентах
- Типизированные параметры навигации через `RootStackParamList`
- `SafeAreaView` из `react-native-safe-area-context`

---

## ADR-003: Модульный Firebase API (v9+)

**Дата:** 2026-05-24  
**Статус:** Accepted  
**Влияет на:** все stories с Firebase

**Решение:** Только модульный tree-shakeable API Firebase v9+.

```typescript
// ПРАВИЛЬНО (v9 модульный):
import { doc, getDoc } from 'firebase/firestore';

// ЗАПРЕЩЕНО (legacy compat):
import firebase from 'firebase/compat/app';
```

**Причина:** Меньший bundle size, лучшая типизация.

---

_Добавлять новые ADR при принятии решений влияющих на 2+ stories._
_Формат: ADR-XXX: [Название], Дата, Статус, Влияет на, Решение, Причина, Последствия._
