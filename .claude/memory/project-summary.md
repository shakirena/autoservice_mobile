# Project Summary: autoservice-mobile

_Сжатый контекст проекта (~500 токенов). Читается всеми агентами ВМЕСТО полного ARCHITECTURE.md._

---

## Стек

| Компонент | Технология | Версия |
|-----------|-----------|--------|
| Framework | Expo (managed workflow) | ~56.0.4 |
| Language | TypeScript (strict) | latest |
| UI | React Native | 0.85.3 |
| Navigation | React Navigation Native Stack | v7 |
| Backend | Firebase (Firestore, Auth, Storage) | 12.x |
| State | React hooks (useState, useEffect, useCallback) | — |
| Testing | Jest + React Testing Library | — |
| Build | EAS Build / Expo Export | — |

## Структура модулей

```
autoservice-mobile/
├── app.json            # Expo config
├── App.tsx             # Root component
├── index.js            # Entry point
├── src/
│   ├── types/          # TypeScript interfaces
│   ├── config/         # Firebase config, constants
│   ├── services/       # Firebase service layer
│   ├── hooks/          # Custom React hooks
│   ├── screens/        # Screen components
│   ├── components/     # Reusable UI components
│   └── navigation/     # Navigation config
├── docs/
│   ├── specs/          # Feature specifications
│   ├── arch/           # Architecture documents
│   └── test-cases/     # TC documentation
├── e2e-tests/          # Detox E2E tests
└── .claude/
    ├── agents/         # Agent definitions
    ├── memory/         # Shared persistent memory
    ├── commands/       # Slash commands
    └── handoffs/       # Dev → QA handoffs
```

## Build & Run команды

```bash
npm start              # Expo dev server
npm run android        # Android emulator
npm run ios            # iOS simulator
npm run web            # Web browser

npx tsc --noEmit       # TypeScript check
npm test               # Jest unit tests
npm test -- --coverage # With coverage

npx expo export --platform web  # Build check (no native)
eas build --platform all --profile preview  # Staging build
eas update --branch staging     # OTA update
```

## Firebase структура

- **Auth**: email/password (Firebase Auth)
- **Database**: Firestore (NoSQL, document-based)
- **Storage**: Firebase Storage (для файлов/изображений)
- **Config**: `src/config/firebase.ts`

## Навигация

React Navigation v7 Native Stack. Структура навигации определяется по мере добавления фич.

## RBAC

Авторизация через Firebase Security Rules + Firebase Auth UID. Пользователь имеет доступ только к своим документам.

## Домен: AutoService Mobile

Мобильное приложение для автосервиса. Функции определяются по мере создания stories.

---

_Обновить этот файл при добавлении новых модулей, зависимостей или изменении структуры проекта._
