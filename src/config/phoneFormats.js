/**
 * phoneFormats — конфигурация поддерживаемых форматов телефонных номеров.
 *
 * Создан как code stub для Feature #1 (поддержка +994 / Азербайджан).
 * Единый источник правды для:
 *  - LoginScreen.handlePhoneChange  (форматирование ввода)      → Story #2
 *  - LoginScreen.handleSendCode     (валидация перед отправкой) → Story #3
 *  - firestore.normalizePhone       (нормализация для хранения) → Story #4
 *
 * См. docs/arch/feature-1-azerbaijan-phone-format.md, ADR-004.
 *
 * ⚠️ STUB: реализация helper-функций ниже — заготовка для developer.
 * Если для конкретной story проще реализовать логику инлайн — это допустимо,
 * но желательно держать единый источник правды по форматам (см. ADR-004).
 */

/**
 * @typedef {Object} CountryPhoneFormat
 * @property {string} code            - код страны без '+' (например, '994')
 * @property {string} prefix          - префикс с '+' (например, '+994')
 * @property {number} nationalLength  - количество цифр после кода страны
 * @property {string} example         - пример для плейсхолдера/подсказки
 */

/** @type {CountryPhoneFormat[]} */
export const COUNTRY_PHONE_FORMATS = [
  // Азербайджан — основной регион использования приложения (Feature #1)
  { code: '994', prefix: '+994', nationalLength: 9,  example: '+994 XX XXX XX XX' },
  // Россия — оставлена для обратной совместимости (NFR-1)
  { code: '7',   prefix: '+7',   nationalLength: 10, example: '+7 (___) ___-__-__' },
];

/**
 * Полная длина номера в формате E.164 (включая '+'), напр. '+994XXXXXXXXX' → 13.
 * @param {CountryPhoneFormat} format
 * @returns {number}
 */
export function fullLength(format) {
  return format.prefix.length + format.nationalLength;
}

/**
 * Определяет формат страны по уже нормализованной строке с префиксом '+'.
 * Возвращает null, если код страны не распознан среди поддерживаемых.
 *
 * @param {string} cleaned - строка вида '+994...' или '+7...'
 * @returns {CountryPhoneFormat | null}
 */
export function detectFormatByPrefix(cleaned) {
  if (!cleaned.startsWith('+')) return null;
  return COUNTRY_PHONE_FORMATS.find((f) => cleaned.startsWith(f.prefix)) ?? null;
}

/**
 * Определяет формат страны по строке "только цифры" (без '+'), используется
 * в normalizePhone, где входные данные приходят в произвольном виде.
 *
 * Правило: код страны определяется по началу строки цифр и общей длине,
 * совпадающей с code.length + nationalLength.
 *
 * @param {string} digits - строка только из цифр (после replace(/\D/g, ''))
 * @returns {CountryPhoneFormat | null}
 */
export function detectFormatByDigits(digits) {
  return (
    COUNTRY_PHONE_FORMATS.find(
      (f) => digits.startsWith(f.code) && digits.length === f.code.length + f.nationalLength
    ) ?? null
  );
}

/**
 * Строит общий regex для валидации всех поддерживаемых форматов:
 * например, /^\+(994\d{9}|7\d{10})$/
 *
 * @returns {RegExp}
 */
export function buildPhoneValidationRegex() {
  const alternatives = COUNTRY_PHONE_FORMATS.map(
    (f) => `${f.code}\\d{${f.nationalLength}}`
  ).join('|');
  return new RegExp(`^\\+(${alternatives})$`);
}

/**
 * Возвращает плейсхолдер/пример для UI на основе распознанного формата
 * (или формата по умолчанию — первого в списке, т.е. Азербайджан).
 *
 * @param {CountryPhoneFormat | null} [format]
 * @returns {string}
 */
export function getPlaceholderFor(format) {
  return (format ?? COUNTRY_PHONE_FORMATS[0]).example;
}
