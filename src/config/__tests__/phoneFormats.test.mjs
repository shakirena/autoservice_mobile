/**
 * Unit tests for src/config/phoneFormats.js (service/config layer, ADR-004).
 *
 * Запуск: node --test src/config/__tests__/phoneFormats.test.mjs
 * (используется встроенный в Node.js test runner — без дополнительных зависимостей,
 *  т.к. в проекте отсутствует настроенный jest/jest-expo; файл .mjs, чтобы Node
 *  загрузил исходник как ES-модуль и понял синтаксис `export`).
 *
 * Покрывает Story #2 / #3: единый контракт COUNTRY_PHONE_FORMATS,
 * detectFormatByPrefix, detectFormatByDigits, buildPhoneValidationRegex, getPlaceholderFor.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  COUNTRY_PHONE_FORMATS,
  fullLength,
  detectFormatByPrefix,
  detectFormatByDigits,
  buildPhoneValidationRegex,
  getPlaceholderFor,
} from '../phoneFormats.js';

test('COUNTRY_PHONE_FORMATS contains AZ (+994) and RU (+7) entries', () => {
  const az = COUNTRY_PHONE_FORMATS.find((f) => f.code === '994');
  const ru = COUNTRY_PHONE_FORMATS.find((f) => f.code === '7');
  assert.ok(az, 'expected +994 format to be present');
  assert.ok(ru, 'expected +7 format to be present');
  assert.equal(az.prefix, '+994');
  assert.equal(az.nationalLength, 9);
  assert.equal(ru.prefix, '+7');
  assert.equal(ru.nationalLength, 10);
});

test('fullLength returns prefix length + national digits length', () => {
  const az = COUNTRY_PHONE_FORMATS.find((f) => f.code === '994');
  const ru = COUNTRY_PHONE_FORMATS.find((f) => f.code === '7');
  assert.equal(fullLength(az), '+994'.length + 9); // 13
  assert.equal(fullLength(ru), '+7'.length + 10);  // 12
});

test('detectFormatByPrefix recognizes +994 and +7 prefixes', () => {
  assert.equal(detectFormatByPrefix('+994501234567').code, '994');
  assert.equal(detectFormatByPrefix('+79161234567').code, '7');
});

test('detectFormatByPrefix returns null for unknown or malformed input', () => {
  assert.equal(detectFormatByPrefix('+1234567890'), null);
  assert.equal(detectFormatByPrefix('994501234567'), null); // no leading '+'
  assert.equal(detectFormatByPrefix(''), null);
});

test('detectFormatByDigits recognizes AZ digits string of correct length', () => {
  const found = detectFormatByDigits('994501234567'); // 994 + 9 digits = 12
  assert.ok(found);
  assert.equal(found.code, '994');
});

test('detectFormatByDigits recognizes RU digits string (7 + 10 digits = 11)', () => {
  const found = detectFormatByDigits('79161234567');
  assert.ok(found);
  assert.equal(found.code, '7');
});

test('detectFormatByDigits returns null when length does not match any known format', () => {
  assert.equal(detectFormatByDigits('99450123'), null);      // too short for AZ
  assert.equal(detectFormatByDigits('9945012345678'), null); // too long for AZ
  assert.equal(detectFormatByDigits(''), null);
});

test('buildPhoneValidationRegex matches valid +994 and +7 E.164 numbers', () => {
  const re = buildPhoneValidationRegex();
  assert.match('+994501234567', re);
  assert.match('+79161234567', re);
});

test('buildPhoneValidationRegex rejects invalid numbers (wrong length / unknown code / injection-like input)', () => {
  const re = buildPhoneValidationRegex();
  assert.doesNotMatch('+99450123456', re);      // AZ: one digit short
  assert.doesNotMatch('+9945012345678', re);    // AZ: one digit too many
  assert.doesNotMatch('+7916123456', re);       // RU: one digit short
  assert.doesNotMatch('+1234567890123', re);    // unknown country code
  assert.doesNotMatch('994501234567', re);      // missing '+'
  assert.doesNotMatch('+994 50 123 45 67', re); // formatting chars not allowed post-normalization
  // regex must be anchored — no partial/embedded matches (protects against injection via concatenation)
  assert.doesNotMatch('+994501234567extra', re);
  assert.doesNotMatch('prefix+994501234567', re);
});

test('getPlaceholderFor falls back to default (AZ) format when format is not recognized', () => {
  assert.equal(getPlaceholderFor(null), COUNTRY_PHONE_FORMATS[0].example);
  assert.equal(getPlaceholderFor(undefined), COUNTRY_PHONE_FORMATS[0].example);
});

test('getPlaceholderFor returns example for a given recognized format', () => {
  const ru = COUNTRY_PHONE_FORMATS.find((f) => f.code === '7');
  assert.equal(getPlaceholderFor(ru), ru.example);
});
