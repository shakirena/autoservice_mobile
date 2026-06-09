/**
 * Unit tests for src/services/phoneUtils.js (service layer — Story #4).
 *
 * Запуск: node --test src/services/__tests__/phoneUtils.test.mjs
 * (встроенный Node.js test runner — в проекте нет настроенного jest/jest-expo;
 *  файл .mjs, чтобы Node загрузил исходник как ES-модуль).
 *
 * Покрывает AC Story #4: normalizePhone(+994 в любом распространённом формате
 * ввода) → корректный E.164 +994XXXXXXXXX, без искажения в +7..., и обратную
 * совместимость с существующими российскими номерами (NFR-1).
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizePhone, formatPhoneDisplay } from '../phoneUtils.js';

test('normalizePhone: AZ number with "+" and no formatting → unchanged E.164', () => {
  assert.equal(normalizePhone('+994501234567'), '+994501234567');
});

test('normalizePhone: AZ number without "+" (raw digits) → +994XXXXXXXXX', () => {
  assert.equal(normalizePhone('994501234567'), '+994501234567');
});

test('normalizePhone: AZ number with spaces/parentheses/dashes → normalized E.164', () => {
  assert.equal(normalizePhone('+994 50 123 45 67'), '+994501234567');
  assert.equal(normalizePhone('994 (50) 123-45-67'), '+994501234567');
  assert.equal(normalizePhone('+994-50-123-45-67'), '+994501234567');
});

test('normalizePhone: AZ number must NOT be converted to +7 (regression guard for ADR-004)', () => {
  const result = normalizePhone('+994501234567');
  assert.equal(result.startsWith('+994'), true);
  assert.equal(result.startsWith('+7'), false);
});

test('normalizePhone: RU number — backward compatibility preserved (NFR-1)', () => {
  // 11 digits starting with 8 → +7XXXXXXXXXX
  assert.equal(normalizePhone('89161234567'), '+79161234567');
  // 11 digits starting with 7 → +7XXXXXXXXXX
  assert.equal(normalizePhone('+79161234567'), '+79161234567');
  assert.equal(normalizePhone('79161234567'), '+79161234567');
  // 10 digits without country code → +7XXXXXXXXXX
  assert.equal(normalizePhone('9161234567'), '+79161234567');
  // formatted RU input
  assert.equal(normalizePhone('+7 (916) 123-45-67'), '+79161234567');
  assert.equal(normalizePhone('8 (916) 123-45-67'), '+79161234567');
});

test('normalizePhone: returns input unchanged when format is unrecognized', () => {
  assert.equal(normalizePhone('not-a-phone'), 'not-a-phone');
  assert.equal(normalizePhone('+1234567'), '+1234567');
  assert.equal(normalizePhone(''), '');
});

test('normalizePhone: does not crash or produce malformed/truncated output on injection-like input', () => {
  // Strings with script-like / SQL-like payloads must never crash the function and
  // must never be silently "normalized" into a misleadingly-valid-looking E.164 number
  // (which could mask injected content behind a trusted-looking phone value).
  // Because digit-extraction picks up stray digits from the payload (e.g. "1" from
  // "alert(1)"), the digit count no longer matches any known format, so the function
  // safely falls through and returns the input untouched — nothing is partially
  // substituted or truncated into a deceptive E.164-looking string.
  const payload = '+994501234567<script>alert(1)</script>';
  const result = normalizePhone(payload);
  assert.equal(typeof result, 'string');
  assert.equal(result, payload, 'unrecognized input must be returned unchanged, not partially transformed');
  assert.equal(/^\+\d+$/.test(result), false, 'must not produce a deceptive valid-looking E.164 string from malicious input');
});

test('normalizePhone: SQL-injection-like payload is not transformed into a valid-looking number', () => {
  const payload = "+994501234567' OR '1'='1";
  const result = normalizePhone(payload);
  assert.equal(result, payload);
});

test('formatPhoneDisplay: RU number formatted for display (unchanged behavior, out of Story #4 scope)', () => {
  assert.equal(formatPhoneDisplay('+79161234567'), '+7 (916) 123-45-67');
  assert.equal(formatPhoneDisplay('89161234567'), '+7 (916) 123-45-67');
});

test('formatPhoneDisplay: returns input unchanged for non-10-digit-RU numbers (e.g. AZ)', () => {
  assert.equal(formatPhoneDisplay('+994501234567'), '+994501234567');
});
