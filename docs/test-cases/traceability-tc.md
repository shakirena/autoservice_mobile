# Test Case Traceability Matrix

| Feature | Story | AC | TC | Unit Test | E2E |
|---------|-------|----|----|-----------|-----|
| #1 [Bug] Невозможно ввести номер телефона с кодом +994 (Азербайджан) | #2 Ввод номера в формате +994 | Given/When/Then (поле отображает +994XXXXXXXXX без обрезания/без авто-+7) | TC-2-001, TC-2-002, TC-2-003, TC-2-004 | ✅ `loginPhoneContract.test.mjs` (Story #2 happy path / truncation guard / boundary) | ❌ |
| #1 [Bug] Невозможно ввести номер телефона с кодом +994 (Азербайджан) | #2 Ввод номера в формате +994 | NFR-1 (обратная совместимость +7) | TC-2-005 | ✅ `loginPhoneContract.test.mjs` (Story #2 NFR-1 RU compatibility) | ❌ |
| #1 [Bug] Невозможно ввести номер телефона с кодом +994 (Азербайджан) | #2 Ввод номера в формате +994 | FR-4 (динамический плейсхолдер `+994 XX XXX XX XX`) | TC-2-006 | ✅ `loginPhoneContract.test.mjs` (placeholder reflects recognized format) | ❌ |
| #1 [Bug] Невозможно ввести номер телефона с кодом +994 (Азербайджан) | #3 Валидация номера перед отправкой кода | Given/When/Then (валидация +994+9 / +7+10, понятная ошибка, без вызова Firebase) | TC-3-001, TC-3-002, TC-3-003, TC-3-004, TC-3-005 | ✅ `loginPhoneContract.test.mjs` (Story #3 happy path / error cases) | ❌ |
| #1 [Bug] Невозможно ввести номер телефона с кодом +994 (Азербайджан) | #3 Валидация номера перед отправкой кода | Security (защита данных до отправки в Firebase, anti-injection) | TC-3-006 | ✅ `phoneUtils.test.mjs` + `phoneFormats.test.mjs` (injection/ReDoS guards) | ❌ |
| #1 [Bug] Невозможно ввести номер телефона с кодом +994 (Азербайджан) | #4 Нормализация и сохранение номеров +994 | Given/When/Then (normalizePhone → +994XXXXXXXXX из любого распространённого формата ввода) | TC-4-001 | ✅ `phoneUtils.test.mjs` (normalizePhone AZ — formats with spaces/parens/dashes) | ❌ |
| #1 [Bug] Невозможно ввести номер телефона с кодом +994 (Азербайджан) | #4 Нормализация и сохранение номеров +994 | Regression guard (НЕ преобразуется в +7) | TC-4-002 | ✅ `phoneUtils.test.mjs` (regression guard for ADR-004) | ❌ |
| #1 [Bug] Невозможно ввести номер телефона с кодом +994 (Азербайджан) | #4 Нормализация и сохранение номеров +994 | NFR-1 (обратная совместимость RU) | TC-4-003 | ✅ `phoneUtils.test.mjs` (RU backward compatibility) | ❌ |
| #1 [Bug] Невозможно ввести номер телефона с кодом +994 (Азербайджан) | #4 Нормализация и сохранение номеров +994 | Edge case (нераспознанный формат — без искажений) | TC-4-004 | ✅ `phoneUtils.test.mjs` (returns input unchanged when unrecognized) | ❌ |
| #1 [Bug] Невозможно ввести номер телефона с кодом +994 (Азербайджан) | #4 Нормализация и сохранение номеров +994 | Security (anti-spoofing E.164, anti-injection в normalizePhone) | TC-4-005 | ✅ `phoneUtils.test.mjs` (injection-like / SQL-like payload guards) | ❌ |
