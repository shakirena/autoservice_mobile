/**
 * phoneUtils — чистые (pure) утилиты нормализации/форматирования номеров телефонов.
 *
 * Вынесены из src/services/firestore.js в отдельный модуль без зависимостей от
 * react-native / firebase, чтобы их можно было покрыть изолированными unit-тестами
 * сервисного слоя (Story #4) и переиспользовать без побочных эффектов.
 *
 * Контракт (см. ADR-004, src/config/phoneFormats.js — COUNTRY_PHONE_FORMATS):
 *  - normalizePhone остаётся реэкспортированным из firestore.js для обратной
 *    совместимости с существующими импортами (LoginScreen, HomeScreen и др.).
 */

import { detectFormatByDigits, COUNTRY_PHONE_FORMATS } from '../config/phoneFormats.js';

/**
 * Нормализует номер телефона к каноническому E.164 на основе общей таблицы
 * COUNTRY_PHONE_FORMATS (см. ADR-004).
 *
 * Поддерживает ввод с пробелами/скобками/дефисами или без них. Для России
 * сохранена обратная совместимость (NFR-1): 10 цифр, либо 11 цифр, начинающиеся
 * с '7'/'8', нормализуются в +7XXXXXXXXXX. Номера с кодом 994 (Азербайджан)
 * нормализуются в +994XXXXXXXXX без преобразования в +7.
 *
 * @param {string} phone - произвольная строка с номером телефона
 * @returns {string} нормализованный E.164-номер, либо исходная строка как есть
 */
export function normalizePhone(phone) {
  const digits = phone.replace(/\D/g, '');

  // Российский traditional-ввод: '8XXXXXXXXXX' (11 цифр, начинается с 8) → +7...
  if (digits.length === 11 && digits.startsWith('8')) {
    return '+7' + digits.slice(1);
  }

  // Распознаём код страны по таблице форматов (включая +994 и +7 с кодом страны в начале)
  const byDigits = detectFormatByDigits(digits);
  if (byDigits) {
    return byDigits.prefix + digits.slice(byDigits.code.length);
  }

  // Российский короткий ввод без кода страны: 10 цифр → +7XXXXXXXXXX
  const ru = COUNTRY_PHONE_FORMATS.find((f) => f.code === '7');
  if (ru && digits.length === ru.nationalLength) {
    return ru.prefix + digits;
  }

  return phone; // возвращаем как есть
}

/**
 * Форматирует российский номер для отображения: +7 (916) 123-45-67
 * Вне scope Story #4 — поведение не меняется (см. "Вне Scope" в story-4.md).
 *
 * @param {string} phone
 * @returns {string}
 */
export function formatPhoneDisplay(phone) {
  const digits = phone.replace(/\D/g, '');
  const d = digits.length === 11 ? digits.slice(1) : digits;
  if (d.length === 10) {
    return `+7 (${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6,8)}-${d.slice(8,10)}`;
  }
  return phone;
}
