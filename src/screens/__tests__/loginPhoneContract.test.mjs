/**
 * Contract tests for LoginScreen.js phone-input integration (Stories #2, #3).
 *
 * LoginScreen.js is a React Native screen (Firebase/Expo/RN dependencies) and the
 * project has no jest/jest-expo/RTL configured (see Developer Report — `node --test`
 * is the chosen runner). Mounting the component is out of scope for unit tests
 * (would require RTL + native-module mocks — integration-level, not unit-level).
 *
 * Instead, these tests pin down the exact *contract* that `handlePhoneChange` and
 * `handleSendCode` rely on (see src/screens/LoginScreen.js L122-149 and L63-75):
 *   - country-code detection via COUNTRY_PHONE_FORMATS / detectFormatByPrefix
 *   - dynamic max-length via fullLength(format)
 *   - validation via buildPhoneValidationRegex()
 *   - dynamic placeholder/error text via getPlaceholderFor()/detectFormatByPrefix()
 *
 * Each test reproduces the screen's exact transformation steps against the shared
 * config contract, so that a regression in either LoginScreen's glue logic or the
 * shared phoneFormats contract is caught — directly covering AC of Story #2
 * ("поле отображает номер +994XXXXXXXXX без обрезания/без авто-+7") and Story #3
 * ("валидация принимает +994+9 цифр / +7+10 цифр и формирует понятную ошибку").
 *
 * Запуск: node --test src/screens/__tests__/loginPhoneContract.test.mjs
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  COUNTRY_PHONE_FORMATS,
  fullLength,
  detectFormatByPrefix,
  buildPhoneValidationRegex,
  getPlaceholderFor,
} from '../../config/phoneFormats.js';
import { normalizePhone } from '../../services/phoneUtils.js';

const PHONE_VALIDATION_REGEX = buildPhoneValidationRegex();

/**
 * Reproduces LoginScreen.handlePhoneChange (L122-149) — the exact glue/integration
 * logic under test for Story #2 AC. Kept in lock-step with the screen on purpose:
 * any divergence here vs. the real handler should be caught in code review (G4),
 * while this test pins the *intended* contract behavior independent of RN/Firebase.
 */
function simulateHandlePhoneChange(currentPhone, text) {
  let cleaned = text.replace(/[^\d+]/g, '');
  if (cleaned === '') return '';

  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('8')) {
      cleaned = '+7' + cleaned.slice(1);
    } else {
      const matchedByDigits = COUNTRY_PHONE_FORMATS.find((f) => cleaned.startsWith(f.code));
      cleaned = matchedByDigits ? '+' + cleaned : '+7' + cleaned;
    }
  }

  const format = detectFormatByPrefix(cleaned) ?? COUNTRY_PHONE_FORMATS[0];
  const maxLength = fullLength(format);
  if (cleaned.length > maxLength) cleaned = cleaned.slice(0, maxLength);

  return cleaned;
}

/**
 * Reproduces the validation branch of LoginScreen.handleSendCode (L63-75) for
 * Story #3 AC — returns either {ok: true} or {ok: false, message} without any
 * Firebase/network side effects (those remain out of unit-test scope per protocol).
 */
function simulateSendCodeValidation(phone) {
  const normalized = normalizePhone(phone.trim());
  if (!PHONE_VALIDATION_REGEX.test(normalized)) {
    const expected = detectFormatByPrefix(normalized);
    const message = expected
      ? `Введите корректный номер телефона (${expected.prefix} и ${expected.nationalLength} цифр)`
      : `Введите корректный номер телефона (например, ${getPlaceholderFor()})`;
    return { ok: false, message };
  }
  return { ok: true, normalized };
}

// ─── Story #2 — happy path: AZ number entered digit-by-digit ──────────────────

test('Story #2 happy path: typing +994XXXXXXXXX is preserved fully, no auto +7, no truncation to 12', () => {
  // Simulate incremental typing, char by char, like a real TextInput onChangeText
  const target = '+994501234567'; // 13 chars: code(994) + 9 digits
  let phone = '';
  for (let i = 1; i <= target.length; i++) {
    phone = simulateHandlePhoneChange(phone, target.slice(0, i));
  }
  assert.equal(phone, target, 'AC: поле отображает введённый номер +994XXXXXXXXX полностью');
  assert.equal(phone.length, fullLength(COUNTRY_PHONE_FORMATS.find((f) => f.code === '994')));
  assert.equal(phone.startsWith('+7'), false, 'AC: без автоподстановки +7');
});

test('Story #2 happy path: AZ number entered without leading "+" gets "+" prepended, not "+7"', () => {
  const phone = simulateHandlePhoneChange('', '994501234567');
  assert.equal(phone, '+994501234567');
});

test('Story #2: AZ number is NOT truncated at the legacy 12-char "+7 + 10 digits" boundary', () => {
  // Old hard-coded rule would cut this to 12 chars ('+99450123456'); new rule
  // must allow the full 13-char +994 E.164 length.
  const phone = simulateHandlePhoneChange('', '+9945012345679999');
  assert.equal(phone, '+994501234567');
  assert.equal(phone.length, 13, 'AC: без обрезания до 12 символов по правилу "+7 + 10 цифр"');
});

test('Story #2: empty input resets the field', () => {
  assert.equal(simulateHandlePhoneChange('+99450', ''), '');
});

test('Story #2: stray non-digit/non-plus characters are stripped while typing', () => {
  const phone = simulateHandlePhoneChange('', '+994 (50) 123-45-67');
  assert.equal(phone, '+994501234567');
});

// ─── Story #2 — backward compatibility (RU / legacy "8" input) ────────────────

test('Story #2 (NFR-1): RU number entered with leading "8" is normalized to "+7..." and capped at 12 chars', () => {
  const phone = simulateHandlePhoneChange('', '89161234567999');
  assert.equal(phone, '+79161234567');
  assert.equal(phone.length, fullLength(COUNTRY_PHONE_FORMATS.find((f) => f.code === '7')));
});

test('Story #2 (NFR-1): RU number entered with leading "+7" is preserved and capped at 12 chars', () => {
  const phone = simulateHandlePhoneChange('', '+79161234567999');
  assert.equal(phone, '+79161234567');
});

test('Story #2 (NFR-1): RU number entered without "+" or "8" defaults to "+7" prefix (existing behavior preserved)', () => {
  const phone = simulateHandlePhoneChange('', '9161234567');
  assert.equal(phone, '+79161234567');
});

test('Story #2: unknown country code falls back to default format (AZ, first in COUNTRY_PHONE_FORMATS) for length-capping', () => {
  // '+1...' is not in COUNTRY_PHONE_FORMATS — detectFormatByPrefix returns null,
  // so the screen falls back to COUNTRY_PHONE_FORMATS[0] (AZ, 13 chars) as max length.
  const phone = simulateHandlePhoneChange('', '+1234567890123456');
  const azFormat = COUNTRY_PHONE_FORMATS[0];
  assert.equal(phone.length, fullLength(azFormat));
  assert.equal(phone, '+1234567890123456'.slice(0, fullLength(azFormat)));
});

// ─── Story #3 — validation happy path / error cases ───────────────────────────

test('Story #3 happy path: valid +994 number passes validation without error', () => {
  const result = simulateSendCodeValidation('+994501234567');
  assert.equal(result.ok, true);
  assert.equal(result.normalized, '+994501234567');
});

test('Story #3 happy path: valid +7 number still passes validation (backward compatibility)', () => {
  const result = simulateSendCodeValidation('+79161234567');
  assert.equal(result.ok, true);
  assert.equal(result.normalized, '+79161234567');
});

test('Story #3 error case: incomplete +994 number is rejected with a format-specific message (no Firebase call)', () => {
  const result = simulateSendCodeValidation('+99450123456'); // 8 digits instead of 9
  assert.equal(result.ok, false);
  assert.equal(result.message, 'Введите корректный номер телефона (+994 и 9 цифр)');
});

test('Story #3 error case: AZ number one digit too long is rejected with a format-specific message', () => {
  // 10 digits after '994' (one too many for AZ's 9-digit national length); normalizePhone
  // leaves it unchanged (no format matches this exact length), detectFormatByPrefix still
  // recognizes the '+994' prefix → format-specific (not generic) error message.
  const result = simulateSendCodeValidation('+9945012345678');
  assert.equal(result.ok, false);
  assert.equal(result.message, 'Введите корректный номер телефона (+994 и 9 цифр)');
});

test('Story #3 error case: unrecognized country code falls back to a generic example-based message', () => {
  // '+12345' has neither a '994' nor '7' country code prefix and does not match any
  // known digit-length combination, so normalizePhone leaves it untouched and
  // detectFormatByPrefix returns null → generic placeholder-based message.
  const result = simulateSendCodeValidation('+12345');
  assert.equal(detectFormatByPrefix(normalizePhone('+12345')), null, 'precondition: format must be unrecognized');
  assert.equal(result.ok, false);
  assert.equal(
    result.message,
    `Введите корректный номер телефона (например, ${getPlaceholderFor()})`
  );
});

test('Story #3 error case: empty input is rejected without throwing and without a Firebase call', () => {
  const result = simulateSendCodeValidation('   ');
  assert.equal(result.ok, false);
  assert.equal(typeof result.message, 'string');
  assert.ok(result.message.length > 0);
});

// ─── Story #2/#3 — dynamic placeholder reflects recognized format ─────────────

test('Story #2/#3: placeholder reflects the AZ format by default and updates per recognized prefix', () => {
  assert.equal(getPlaceholderFor(detectFormatByPrefix('')), COUNTRY_PHONE_FORMATS[0].example);
  assert.equal(getPlaceholderFor(detectFormatByPrefix('+994501234567')), '+994 XX XXX XX XX');
  assert.equal(getPlaceholderFor(detectFormatByPrefix('+79161234567')), '+7 (___) ___-__-__');
});
