# Test Cases: Feature #1 — Поддержка азербайджанского формата номера телефона (+994)

**Версия:** 1.0
**Дата:** 2026-06-08
**Автор:** test-case-writer (qa-lead flow, /test #2 #3 #4)
**Связанные:** Spec: `docs/specs/feature-1-azerbaijan-phone-format.md`, Arch: `docs/arch/feature-1-azerbaijan-phone-format.md` (ADR-004)
**Branch:** `feature/2-3-4-azerbaijan-phone-format` @ `929ef70`/`c5691a7`
**Stories:** #2 (ввод), #3 (валидация), #4 (нормализация/хранение)

---

## Story #2 — Ввод номера телефона в формате +994 на экране входа

**AC:**
```
Given пользователь открыл экран входа и поле номера телефона пусто
When он вводит цифры номера в формате +994XXXXXXXXX (код страны 994 + 9 цифр)
Then поле отображает введённый номер полностью, без автоподстановки +7 и без обрезания до 12 символов по правилу "+7 + 10 цифр"
```

### TC-2-001: Happy Path — ввод полного номера +994XXXXXXXXX отображается без искажений

**Priority:** Critical
**Type:** Functional
**AC:** Story #2 G/W/T
**E2E Automated:** No ← (обновится после `/e2e`)
**Unit Test:** `src/screens/__tests__/loginPhoneContract.test.mjs` → "Story #2 happy path: typing +994XXXXXXXXX is preserved fully..."

#### Preconditions
- Экран входа (`LoginScreen`) открыт, шаг STEP_PHONE
- Поле номера телефона пусто

#### Steps
| # | Действие | Ожидаемый результат |
|---|----------|---------------------|
| 1 | Ввести посимвольно `+994501234567` (13 символов: `+994` + 9 цифр) | Поле отображает каждый промежуточный фрагмент без обрезания |
| 2 | Завершить ввод | Поле содержит ровно `+994501234567` |
| 3 | Проверить, что номер не начинается с `+7` | Подтверждено — нет автоподстановки `+7` |

#### Expected Result
Поле полностью отображает `+994501234567` (13 символов), без преобразования в `+7...`.

#### Test Data
- Input: `+994501234567` (вводится посимвольно через `onChangeText`)
- Expected: `+994501234567`

---

### TC-2-002: Happy Path — ввод без `+` автоматически получает префикс `+994`, а не `+7`

**Priority:** High
**Type:** Functional
**AC:** Story #2 G/W/T
**E2E Automated:** No
**Unit Test:** `loginPhoneContract.test.mjs` → "Story #2 happy path: AZ number entered without leading + gets + prepended, not +7"

#### Preconditions
- Поле номера телефона пусто

#### Steps
| # | Действие | Ожидаемый результат |
|---|----------|---------------------|
| 1 | Ввести `994501234567` (без `+`, 12 цифр, начинается с кода `994`) | Приложение распознаёт код страны `994` по `COUNTRY_PHONE_FORMATS` |
| 2 | Проверить отображаемое значение | Поле показывает `+994501234567` |

#### Expected Result
Код страны `994` распознаётся по началу цифровой строки (`detectFormatByPrefix`/`COUNTRY_PHONE_FORMATS`), а не подставляется `+7` по умолчанию.

#### Test Data
- Input: `994501234567`
- Expected: `+994501234567`

---

### TC-2-003: Error/Boundary Case — номер +994 не обрезается по старому правилу "12 символов"

**Priority:** Critical
**Type:** Negative / Regression Guard
**AC:** Story #2 G/W/T (часть "без обрезания до 12 символов")
**E2E Automated:** No
**Unit Test:** `loginPhoneContract.test.mjs` → "Story #2: AZ number is NOT truncated at the legacy 12-char boundary"

#### Preconditions
- Поле номера телефона пусто
- Известен баг до фикса: номер `+994` (13 символов) обрезался до 12 по правилу `+7 + 10 цифр`

#### Steps
| # | Действие | Ожидаемый результат |
|---|----------|---------------------|
| 1 | Ввести строку длиннее 13 символов, например `+9945012345679999` | Приложение распознаёт формат `+994` (13 символов = `fullLength`) |
| 2 | Проверить итоговое значение поля | Поле содержит ровно 13 символов: `+994501234567` (НЕ 12-символьный обрезок `+99450123456`) |

#### Expected Result
Лимит длины вычисляется динамически (`fullLength(format)`), для `+994` это 13 символов, а не статичные 12. Регрессия (обрезание до старого правила "+7 + 10 цифр") не воспроизводится.

#### Test Data
- Input: `+9945012345679999`
- Expected: `+994501234567` (length = 13)

---

### TC-2-004: Edge Case — пустой ввод и посторонние символы

**Priority:** Medium
**Type:** Boundary
**AC:** Story #2 G/W/T (предусловие "поле телефона пусто")
**E2E Automated:** No
**Unit Test:** `loginPhoneContract.test.mjs` → "Story #2: empty input resets the field" / "stray non-digit/non-plus characters are stripped"

#### Steps
| # | Действие | Ожидаемый результат |
|---|----------|---------------------|
| 1 | Очистить поле (стереть весь ввод) | Поле становится пустой строкой `''` |
| 2 | Ввести `+994 (50) 123-45-67` (с пробелами/скобками/дефисами) | Поле показывает только цифры и `+`: `+994501234567` |

#### Expected Result
Непечатаемые/форматирующие символы отфильтровываются на лету (`replace(/[^\d+]/g, '')`), пустой ввод корректно сбрасывает поле.

---

### TC-2-005: Backward Compatibility (NFR-1) — ввод российского номера остаётся прежним

**Priority:** Critical
**Type:** Regression
**AC:** NFR-1 (совместимость с `+7`)
**E2E Automated:** No
**Unit Test:** `loginPhoneContract.test.mjs` → "Story #2 (NFR-1): RU number entered with leading 8 / +7 / without prefix..."

#### Steps
| # | Действие | Ожидаемый результат |
|---|----------|---------------------|
| 1 | Ввести `89161234567...` (традиционный формат с `8`) | Поле показывает `+79161234567` (12 символов), обрезано по формату `+7` |
| 2 | Ввести `+79161234567...` | Поле показывает `+79161234567`, не более 12 символов |
| 3 | Ввести `9161234567` (10 цифр без кода страны) | Поле показывает `+79161234567` (поведение как до фикса — по умолчанию `+7`) |

#### Expected Result
Существующий вход по `+7` не сломан фичей — поведение идентично состоянию до изменений (см. ADR-004 / NFR-1).

---

### TC-2-006: Edge Case — динамический плейсхолдер отражает распознанный формат

**Priority:** Medium
**Type:** Functional / UX
**AC:** Story #2 Technical Notes (FR-4 — плейсхолдер `+994 XX XXX XX XX`)
**E2E Automated:** No
**Unit Test:** `loginPhoneContract.test.mjs` → "Story #2/#3: placeholder reflects the AZ format by default and updates per recognized prefix"

#### Steps
| # | Действие | Ожидаемый результат |
|---|----------|---------------------|
| 1 | Открыть экран входа (поле пусто) | Плейсхолдер по умолчанию: `+994 XX XXX XX XX` (формат AZ — первый в `COUNTRY_PHONE_FORMATS`) |
| 2 | Начать вводить номер с `+7` | Плейсхолдер обновляется на `+7 (___) ___-__-__` |

#### Expected Result
Плейсхолдер формируется динамически через `getPlaceholderFor(detectFormatByPrefix(phone))`, отражая актуальный для Азербайджана формат по умолчанию (FR-4).

---

## Story #3 — Валидация азербайджанского номера перед отправкой кода

**AC:**
```
Given пользователь ввёл номер телефона на экране входа
When он нажимает кнопку "Получить код"
Then приложение валидирует номер по паттерну +994 + 9 цифр (или +7 + 10 цифр для обратной совместимости),
и при некорректном вводе показывает понятное сообщение об ошибке без отправки запроса в Firebase
```

### TC-3-001: Happy Path — корректный номер +994 проходит валидацию и инициирует отправку кода

**Priority:** Critical
**Type:** Functional
**AC:** Story #3 G/W/T
**E2E Automated:** No
**Unit Test:** `loginPhoneContract.test.mjs` → "Story #3 happy path: valid +994 number passes validation without error"

#### Preconditions
- Пользователь ввёл `+994501234567` в поле телефона

#### Steps
| # | Действие | Ожидаемый результат |
|---|----------|---------------------|
| 1 | Нажать кнопку "Получить код" | `normalizePhone` возвращает `+994501234567`; `PHONE_VALIDATION_REGEX` (`/^\+(994\d{9}\|7\d{10})$/`) — match |
| 2 | Проверить состояние ошибки | `error` остаётся пустым, запрос `provider.verifyPhoneNumber` инициируется |

#### Expected Result
Корректный номер `+994` + 9 цифр проходит валидацию без ошибки, флоу продолжается к отправке SMS.

#### Test Data
- Input: `+994501234567`
- Expected: validation passes, `normalized === '+994501234567'`

---

### TC-3-002: Happy Path — корректный номер +7 по-прежнему проходит валидацию (обратная совместимость)

**Priority:** High
**Type:** Functional / Regression
**AC:** Story #3 G/W/T ("...или +7 + 10 цифр для обратной совместимости")
**E2E Automated:** No
**Unit Test:** `loginPhoneContract.test.mjs` → "Story #3 happy path: valid +7 number still passes validation"

#### Steps
| # | Действие | Ожидаемый результат |
|---|----------|---------------------|
| 1 | Ввести `+79161234567`, нажать "Получить код" | Регекс `/^\+(994\d{9}\|7\d{10})$/` matches; ошибка не показывается |

#### Expected Result
Существующий формат `+7` + 10 цифр продолжает приниматься (NFR-1).

---

### TC-3-003: Error Case — некорректный номер +994 (неверная длина) отклоняется с понятным сообщением, без вызова Firebase

**Priority:** Critical
**Type:** Negative
**AC:** Story #3 G/W/T ("...при некорректном вводе показывает понятное сообщение об ошибке без отправки запроса в Firebase")
**E2E Automated:** No
**Unit Test:** `loginPhoneContract.test.mjs` → "Story #3 error case: incomplete +994 number is rejected..." / "...AZ number one digit too long..."

#### Preconditions
- Введён номер `+99450123456` (8 цифр вместо 9 — на одну цифру короче) либо `+9945012345678` (10 цифр вместо 9)

#### Steps
| # | Действие | Ожидаемый результат |
|---|----------|---------------------|
| 1 | Нажать "Получить код" с заведомо неполным номером `+99450123456` | Валидация regex не проходит; `detectFormatByPrefix` распознаёт код `+994` |
| 2 | Проверить текст ошибки | `"Введите корректный номер телефона (+994 и 9 цифр)"` — отражает именно распознанный формат |
| 3 | Проверить, что запрос в Firebase НЕ отправлен | `provider.verifyPhoneNumber` не вызывается (early return до `setLoading(true)`) |

#### Expected Result
- Пользователь видит понятное, формат-специфичное сообщение об ошибке на русском языке (NFR-3)
- Запрос к Firebase Phone Auth не отправляется
- Состояние `loading` не меняется, экран остаётся в STEP_PHONE

#### Test Data
- Input: `+99450123456` (короткий) / `+9945012345678` (длинный)
- Expected message: `Введите корректный номер телефона (+994 и 9 цифр)`

---

### TC-3-004: Error Case — нераспознанный код страны отклоняется с обобщённым сообщением (на основе плейсхолдера по умолчанию)

**Priority:** High
**Type:** Negative / Edge Case
**AC:** Story #3 G/W/T (динамическое сообщение об ошибке)
**E2E Automated:** No
**Unit Test:** `loginPhoneContract.test.mjs` → "Story #3 error case: unrecognized country code falls back to a generic example-based message"

#### Steps
| # | Действие | Ожидаемый результат |
|---|----------|---------------------|
| 1 | Ввести номер с нераспознаваемым кодом страны, например `+12345`, нажать "Получить код" | `normalizePhone` оставляет номер как есть; `detectFormatByPrefix` возвращает `null` |
| 2 | Проверить текст ошибки | `"Введите корректный номер телефона (например, +994 XX XXX XX XX)"` — обобщённое сообщение на основе `getPlaceholderFor()` (формат AZ по умолчанию) |

#### Expected Result
Когда формат не распознан, сообщение деградирует на обобщённый пример (формат AZ — основной регион использования приложения), а не падает / не показывает технический текст.

---

### TC-3-005: Error Case — пустой/пробельный ввод отклоняется без побочных эффектов

**Priority:** Medium
**Type:** Boundary
**AC:** Story #3 G/W/T
**E2E Automated:** No
**Unit Test:** `loginPhoneContract.test.mjs` → "Story #3 error case: empty input is rejected without throwing and without a Firebase call"

#### Steps
| # | Действие | Ожидаемый результат |
|---|----------|---------------------|
| 1 | Оставить поле пустым/из пробелов (`'   '`), нажать "Получить код" | Валидация отклоняет ввод, не выбрасывает исключение |
| 2 | Проверить отображаемое сообщение | Непустая строка с понятным сообщением об ошибке; запрос в Firebase не отправлен |

#### Expected Result
Граничные значения (пустая строка, только пробелы) обрабатываются предсказуемо — ошибка показывается, приложение не падает.

---

### TC-3-006 (RBAC/Security): Доступ к экрану ввода и валидации не требует аутентификации; данные не утекают в Firebase до успешной валидации

**Priority:** Critical
**Type:** Security
**AC:** ADR-004 / Security Review (issue #2,#3,#4 — `security:passed`)
**E2E Automated:** No

#### Контекст
`LoginScreen` — экран **до** аутентификации (это сам флоу входа), поэтому классическая RBAC-проверка "доступ только к своим данным через Firebase Security Rules" неприменима к самому полю ввода телефона. Тем не менее, фича затрагивает данные, которые в дальнейшем используются для аутентификации и поиска профиля (`where('phone', '==', normalized)`), поэтому проверяется смежный security-контракт, подтверждённый security-review (см. comment "Security Review Report — security:passed" в issue #2/#3/#4):

#### Preconditions
- Пользователь НЕ аутентифицирован (находится на экране входа)

#### Steps
| # | Действие | Ожидаемый результат |
|---|----------|---------------------|
| 1 | Открыть `LoginScreen` без активной сессии | Экран доступен — это ожидаемо (часть публичного sign-in флоу), запрос на чтение/запись данных другого пользователя не выполняется |
| 2 | Ввести заведомо некорректный/неполный номер и нажать "Получить код" | Валидация блокирует запрос **до** вызова `provider.verifyPhoneNumber` — нет утечки промежуточного ввода в Firebase |
| 3 | Ввести injection-like строку (`+994501234567' OR '1'='1`, `<script>...`) | `normalizePhone` не конструирует "обманчиво"-валидный E.164 — возвращает вход без изменений (regression-guard тест в `phoneUtils.test.mjs`); `where('phone', '==', normalized)` использует типизированный Firestore query builder — NoSQL injection невозможен |

#### Expected Result
- Невалидный/потенциально вредоносный ввод не достигает Firebase до прохождения клиентской валидации (defence-in-depth; финальная граница — Firebase Security Rules, не затронуты этой фичей)
- `normalizePhone` не создаёт условий для записи искажённого/спуфленного номера в Firestore (см. Security Review Report, п.2 "Целостность данных / спуфинг E.164")
- Изменений в логике `PhoneAuthProvider`/`signInWithCredential` нет — поверхность атаки аутентификации не расширена

#### Test Data
- Injection payloads: `+994501234567<script>alert(1)</script>`, `+994501234567' OR '1'='1`
- Покрыто unit-тестами: `phoneUtils.test.mjs` → "does not crash or produce malformed/truncated output on injection-like input", "SQL-injection-like payload is not transformed..."; `phoneFormats.test.mjs` → "buildPhoneValidationRegex rejects ... injection-like input"

---

## Story #4 — Нормализация и сохранение номеров с кодом +994 в Firestore

**AC:**
```
Given на вход функции normalizePhone подан номер с кодом +994 в любом из распространённых форматов ввода
(с пробелами, скобками, дефисами или без них)
When функция выполняет нормализацию
Then результатом является корректный E.164-номер вида +994XXXXXXXXX без преобразования в формат +7
```

### TC-4-001: Happy Path — normalizePhone приводит +994-номер в любом распространённом формате к каноническому E.164

**Priority:** Critical
**Type:** Functional
**AC:** Story #4 G/W/T
**E2E Automated:** No
**Unit Test:** `phoneUtils.test.mjs` → "normalizePhone: AZ number with +/without +/with spaces-parentheses-dashes"

#### Preconditions
- Чистая функция `normalizePhone` импортирована из `src/services/phoneUtils.js` (или ре-экспорта `firestore.js`)

#### Steps
| # | Действие | Ожидаемый результат |
|---|----------|---------------------|
| 1 | Вызвать `normalizePhone('+994501234567')` (уже E.164) | Результат: `+994501234567` (без изменений) |
| 2 | Вызвать `normalizePhone('994501234567')` (без `+`) | Результат: `+994501234567` |
| 3 | Вызвать `normalizePhone('+994 50 123 45 67')` (с пробелами) | Результат: `+994501234567` |
| 4 | Вызвать `normalizePhone('994 (50) 123-45-67')` (скобки/дефисы) | Результат: `+994501234567` |
| 5 | Вызвать `normalizePhone('+994-50-123-45-67')` (дефисы) | Результат: `+994501234567` |

#### Expected Result
Независимо от формата ввода (с `+`/без, с пробелами/скобками/дефисами), результат — канонический E.164 `+994501234567`, готовый для записи/поиска в Firestore (`where('phone', '==', normalized)`).

#### Test Data
- Inputs: `+994501234567`, `994501234567`, `+994 50 123 45 67`, `994 (50) 123-45-67`, `+994-50-123-45-67`
- Expected (все варианты): `+994501234567`

---

### TC-4-002: Regression Guard — номер +994 НЕ преобразуется в +7

**Priority:** Critical
**Type:** Negative / Regression
**AC:** Story #4 G/W/T ("...без преобразования в формат +7")
**E2E Automated:** No
**Unit Test:** `phoneUtils.test.mjs` → "normalizePhone: AZ number must NOT be converted to +7 (regression guard for ADR-004)"

#### Контекст
Это прямой regression-guard для исходного бага Feature #1 — старая реализация принудительно приводила любой 10/11-значный номер к `+7...`, что искажало азербайджанские номера.

#### Steps
| # | Действие | Ожидаемый результат |
|---|----------|---------------------|
| 1 | Вызвать `normalizePhone('+994501234567')` | Результат начинается с `+994` |
| 2 | Проверить, что результат НЕ начинается с `+7` | Подтверждено — нет искажения в российский формат |

#### Expected Result
`normalizePhone(...).startsWith('+994') === true` и `normalizePhone(...).startsWith('+7') === false` — гарантия, что баг Feature #1 не воспроизводится.

---

### TC-4-003: Backward Compatibility (NFR-1) — российские номера нормализуются как раньше

**Priority:** Critical
**Type:** Regression
**AC:** NFR-1 + Story #4 Technical Notes ("Сохранить обратную совместимость")
**E2E Automated:** No
**Unit Test:** `phoneUtils.test.mjs` → "normalizePhone: RU number — backward compatibility preserved (NFR-1)"

#### Steps
| # | Действие | Ожидаемый результат |
|---|----------|---------------------|
| 1 | `normalizePhone('89161234567')` (11 цифр, начинается с `8`) | `+79161234567` |
| 2 | `normalizePhone('+79161234567')` / `normalizePhone('79161234567')` (11 цифр, код `7`) | `+79161234567` |
| 3 | `normalizePhone('9161234567')` (10 цифр, без кода страны) | `+79161234567` |
| 4 | `normalizePhone('+7 (916) 123-45-67')` / `normalizePhone('8 (916) 123-45-67')` (форматированный ввод) | `+79161234567` |

#### Expected Result
Все варианты ввода российских номеров дают идентичный результат поведению до фикса — НЕ ломают существующих пользователей (NFR-1).

---

### TC-4-004: Error/Edge Case — нераспознанный формат возвращается без изменений (no silent corruption)

**Priority:** High
**Type:** Negative / Boundary
**AC:** Story #4 (контракт "не искажать данные")
**E2E Automated:** No
**Unit Test:** `phoneUtils.test.mjs` → "normalizePhone: returns input unchanged when format is unrecognized"

#### Steps
| # | Действие | Ожидаемый результат |
|---|----------|---------------------|
| 1 | `normalizePhone('not-a-phone')` | Результат: `'not-a-phone'` (без изменений) |
| 2 | `normalizePhone('+1234567')` (нераспознанный код страны) | Результат: `'+1234567'` (без изменений) |
| 3 | `normalizePhone('')` (пустая строка) | Результат: `''` |

#### Expected Result
Для нераспознанных форматов функция возвращает вход как есть — не пытается "угадать" и не производит частично-преобразованный/искажённый результат, который мог бы быть ошибочно записан в Firestore.

---

### TC-4-005 (RBAC/Security): normalizePhone устойчив к injection-подобному вводу — не создаёт "обманчиво"-валидный E.164 для записи в Firestore

**Priority:** Critical
**Type:** Security
**AC:** ADR-004 / Security Review (см. comment "Security Review Report — security:passed", п.2 "Целостность данных / спуфинг E.164")
**E2E Automated:** No
**Unit Test:** `phoneUtils.test.mjs` → "does not crash or produce malformed/truncated output on injection-like input" / "SQL-injection-like payload is not transformed into a valid-looking number"

#### Контекст
Прямого RBAC-проявления (Firestore Security Rules) у `normalizePhone` нет — это чистая функция без I/O. Однако её результат напрямую участвует в построении Firestore-запроса `where('phone', '==', normalized)`, поэтому защитный контракт целостности данных — критическая часть security-границы фичи (зафиксировано в Security Review Report).

#### Preconditions
- `normalizePhone` вызывается с потенциально вредоносным вводом (например, скопированным из буфера обмена в поле телефона)

#### Steps
| # | Действие | Ожидаемый результат |
|---|----------|---------------------|
| 1 | `normalizePhone('+994501234567<script>alert(1)</script>')` | Функция не падает; возвращает строку без изменений (длина цифр не совпадает ни с одним форматом → safe fallthrough) |
| 2 | Проверить, что результат НЕ выглядит как валидный E.164 (`/^\+\d+$/`) | Подтверждено — не сконструирована "обманчиво"-валидная строка из вредоносного ввода |
| 3 | `normalizePhone("+994501234567' OR '1'='1")` (SQL-like payload) | Результат идентичен входу — не "нормализован" в частично-валидный номер |

#### Expected Result
- `normalizePhone` никогда не выбрасывает исключение и не "обманчиво" нормализует вредоносный ввод в похожую-на-валидную E.164-строку
- Использование Firestore typed query builder (`where`/`query`/`collection`) исключает NoSQL injection независимо от содержимого результирующей строки (см. Security Review Report, п.3)
- Риск записи искажённого/спуфленного номера в Firestore — отсутствует

#### Test Data
- Payloads: `+994501234567<script>alert(1)</script>`, `+994501234567' OR '1'='1`
- Expected: вход возвращается без изменений, `/^\+\d+$/.test(result) === false`

---

## Related Test Cases

| TC | Feature | Связь |
|----|---------|-------|
| _нет связанных TC в других feature-документах на момент написания (это первый TC doc для auth/phone-input домена)_ | — | — |

> Cross-reference sync: при создании будущих TC-документов для auth/login флоу (например, фичи Email/Password входа или других стран) — добавить ссылку на TC-2-xxx/TC-3-xxx/TC-4-xxx как на прецедент паттерна "формат-специфичная валидация по таблице форматов" (ADR-004).

## Traceability Matrix (краткая)

| AC | TC | Тип | Автоматизирован |
|----|----|----|-----------------|
| Story #2 G/W/T (ввод +994 без обрезания/авто-+7) | TC-2-001, TC-2-002, TC-2-003, TC-2-004 | Functional + Negative + Boundary | ❌ (unit: ✅ `loginPhoneContract.test.mjs`) |
| Story #2 NFR-1 (совместимость +7) | TC-2-005 | Regression | ❌ (unit: ✅) |
| Story #2 FR-4 (динамический плейсхолдер) | TC-2-006 | Functional/UX | ❌ (unit: ✅) |
| Story #3 G/W/T (валидация +994/+7, понятная ошибка, без вызова Firebase) | TC-3-001, TC-3-002, TC-3-003, TC-3-004, TC-3-005 | Functional + Negative + Boundary | ❌ (unit: ✅ `loginPhoneContract.test.mjs`) |
| Story #3 / Security Review (защита данных до отправки в Firebase) | TC-3-006 | Security | ❌ (unit: ✅ injection-guard tests) |
| Story #4 G/W/T (normalizePhone → +994XXXXXXXXX, любой формат ввода) | TC-4-001 | Functional | ❌ (unit: ✅ `phoneUtils.test.mjs`) |
| Story #4 G/W/T (НЕ преобразуется в +7 — regression guard) | TC-4-002 | Regression | ❌ (unit: ✅) |
| Story #4 NFR-1 (обратная совместимость RU) | TC-4-003 | Regression | ❌ (unit: ✅) |
| Story #4 (нераспознанный формат — без искажений) | TC-4-004 | Negative/Boundary | ❌ (unit: ✅) |
| Story #4 / Security Review (целостность E.164, anti-spoofing, anti-injection) | TC-4-005 | Security | ❌ (unit: ✅ injection-guard tests) |

_E2E Automated: No — обновится после `/e2e #2 #3 #4`._
