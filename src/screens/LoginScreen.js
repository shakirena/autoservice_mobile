/**
 * LoginScreen — вход по номеру телефона (Firebase Phone Auth + reCAPTCHA)
 *
 * Шаги:
 *  1. Ввод номера телефона (+7...)
 *  2. Нажать «Получить код» → reCAPTCHA → SMS
 *  3. Ввести 6-значный код из SMS
 *  4. Нажать «Войти» → signInWithCredential → RootNavigator сам переключит экран
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// expo-firebase-recaptcha работает только на iOS/Android (нужен WebView)
// На Web используем заглушку — Phone Auth в браузере требует отдельной настройки
import { PhoneAuthProvider, signInWithCredential, RecaptchaVerifier } from 'firebase/auth';
import { app, auth } from '../config/firebase';
import { COLORS, SPACING, RADIUS, SHADOW } from '../config/theme';
import { normalizePhone } from '../services/firestore';
import {
  COUNTRY_PHONE_FORMATS,
  fullLength,
  detectFormatByPrefix,
  buildPhoneValidationRegex,
  getPlaceholderFor,
} from '../config/phoneFormats';

// Единый regex для валидации всех поддерживаемых форматов (+994 и +7), см. ADR-004
const PHONE_VALIDATION_REGEX = buildPhoneValidationRegex();

// Lazy-import на native, чтобы не крашить web-preview
const getNativeRecaptcha = () => {
  if (Platform.OS === 'web') return null;
  return require('expo-firebase-recaptcha').FirebaseRecaptchaVerifierModal;
};

// ─── Шаги формы ───────────────────────────────────────────────────────────────
const STEP_PHONE = 'phone';
const STEP_CODE  = 'code';

export default function LoginScreen() {
  const recaptchaRef = useRef(null);

  const [step,           setStep]           = useState(STEP_PHONE);
  const [phone,          setPhone]          = useState('');
  const [code,           setCode]           = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');

  // ─── Шаг 1: отправить SMS ──────────────────────────────────────────────────
  const handleSendCode = async () => {
    setError('');
    const normalized = normalizePhone(phone.trim());

    if (!PHONE_VALIDATION_REGEX.test(normalized)) {
      const expected = detectFormatByPrefix(normalized);
      setError(
        expected
          ? `Введите корректный номер телефона (${expected.prefix} и ${expected.nationalLength} цифр)`
          : `Введите корректный номер телефона (например, ${getPlaceholderFor()})`
      );
      return;
    }

    setLoading(true);
    try {
      const provider = new PhoneAuthProvider(auth);

      // На web используем стандартный RecaptchaVerifier (требует DOM-элемент)
      // На native используем FirebaseRecaptchaVerifierModal (ref)
      const verifier = Platform.OS === 'web'
        ? new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' })
        : recaptchaRef.current;

      const id = await provider.verifyPhoneNumber(normalized, verifier);
      setVerificationId(id);
      setStep(STEP_CODE);
    } catch (err) {
      console.error('[Login] sendCode error:', err);
      setError(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  // ─── Шаг 2: подтвердить код ────────────────────────────────────────────────
  const handleVerifyCode = async () => {
    setError('');
    const trimmedCode = code.trim();

    if (!/^\d{6}$/.test(trimmedCode)) {
      setError('Код должен состоять из 6 цифр');
      return;
    }

    setLoading(true);
    try {
      const credential = PhoneAuthProvider.credential(verificationId, trimmedCode);
      await signInWithCredential(auth, credential);
      // RootNavigator автоматически переключит на HomeScreen
    } catch (err) {
      console.error('[Login] verifyCode error:', err);
      setError(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  // ─── Форматирование ввода телефона ─────────────────────────────────────────
  const handlePhoneChange = (text) => {
    // Оставляем только цифры и +
    let cleaned = text.replace(/[^\d+]/g, '');
    if (cleaned === '') {
      setPhone('');
      return;
    }

    // Нормализуем начало строки до распознаваемого префикса с '+'.
    // ADR-004: код страны определяется по таблице COUNTRY_PHONE_FORMATS,
    // вместо хардкода '+7' — это позволяет вводить +994 без искажений.
    if (!cleaned.startsWith('+')) {
      if (cleaned.startsWith('8')) {
        // '8XXXXXXXXXX' — традиционный российский ввод → '+7XXXXXXXXXX'
        cleaned = '+7' + cleaned.slice(1);
      } else {
        const matchedByDigits = COUNTRY_PHONE_FORMATS.find((f) => cleaned.startsWith(f.code));
        cleaned = matchedByDigits ? '+' + cleaned : '+7' + cleaned;
      }
    }

    // Динамический лимит длины: код страны + национальная часть (или формат по умолчанию)
    const format = detectFormatByPrefix(cleaned) ?? COUNTRY_PHONE_FORMATS[0];
    const maxLength = fullLength(format);
    if (cleaned.length > maxLength) cleaned = cleaned.slice(0, maxLength);

    setPhone(cleaned);
  };

  const handleCodeChange = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
  };

  const goBack = () => {
    setStep(STEP_PHONE);
    setCode('');
    setError('');
    setVerificationId(null);
  };

  // ─── Рендер ────────────────────────────────────────────────────────────────
  // Lazy-получаем компонент только для native
  const NativeRecaptchaModal = Platform.OS !== 'web' ? getNativeRecaptcha() : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* reCAPTCHA: на native — WebView-модалка, на web — скрытый div */}
      {NativeRecaptchaModal && (
        <NativeRecaptchaModal
          ref={recaptchaRef}
          firebaseConfig={app.options}
          attemptInvisibleVerification
          title="Подтверждение"
          cancelLabel="Отмена"
        />
      )}
      {Platform.OS === 'web' && (
        <View nativeID="recaptcha-container" style={{ height: 0, overflow: 'hidden' }} />
      )}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Шапка ─────────────────────────────────────────────────── */}
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🔧</Text>
            </View>
            <Text style={styles.appTitle}>АвтоСервис</Text>
            <Text style={styles.appSubtitle}>Личный кабинет клиента</Text>
          </View>

          {/* ── Карточка формы ────────────────────────────────────────── */}
          <View style={styles.card}>
            {step === STEP_PHONE ? (
              <>
                <Text style={styles.stepTitle}>Вход по номеру телефона</Text>
                <Text style={styles.stepHint}>
                  Мы отправим SMS с кодом подтверждения
                </Text>

                <Text style={styles.label}>Номер телефона</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  placeholder={getPlaceholderFor(detectFormatByPrefix(phone))}
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="phone-pad"
                  textContentType="telephoneNumber"
                  autoFocus
                  editable={!loading}
                />

                {!!error && <Text style={styles.errorText}>{error}</Text>}

                <TouchableOpacity
                  style={[styles.primaryBtn, loading && styles.btnDisabled]}
                  onPress={handleSendCode}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.primaryBtnText}>Получить код</Text>
                  }
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={goBack} style={styles.backRow}>
                  <Text style={styles.backArrow}>←</Text>
                  <Text style={styles.backText}>Изменить номер</Text>
                </TouchableOpacity>

                <Text style={styles.stepTitle}>Введите код из SMS</Text>
                <Text style={styles.stepHint}>
                  Код отправлен на номер{' '}
                  <Text style={styles.phoneHighlight}>{phone}</Text>
                </Text>

                <Text style={styles.label}>Код подтверждения</Text>
                <TextInput
                  style={[styles.input, styles.codeInput]}
                  value={code}
                  onChangeText={handleCodeChange}
                  placeholder="• • • • • •"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  maxLength={6}
                  autoFocus
                  editable={!loading}
                />

                {!!error && <Text style={styles.errorText}>{error}</Text>}

                <TouchableOpacity
                  style={[styles.primaryBtn, (loading || code.length < 6) && styles.btnDisabled]}
                  onPress={handleVerifyCode}
                  disabled={loading || code.length < 6}
                  activeOpacity={0.8}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.primaryBtnText}>Войти</Text>
                  }
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendBtn}
                  onPress={goBack}
                  disabled={loading}
                >
                  <Text style={styles.resendText}>Отправить код повторно</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <Text style={styles.legalText}>
            Входя в приложение, вы соглашаетесь с условиями использования
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Утилита: читаемые сообщения об ошибках Firebase ─────────────────────────
function getAuthErrorMessage(code) {
  const map = {
    'auth/invalid-phone-number':     'Некорректный номер телефона',
    'auth/too-many-requests':        'Слишком много попыток. Попробуйте позже',
    'auth/invalid-verification-code':'Неверный код. Проверьте и повторите',
    'auth/code-expired':             'Код устарел. Запросите новый',
    'auth/quota-exceeded':           'Превышена квота SMS. Попробуйте позже',
    'auth/captcha-check-failed':     'Ошибка reCAPTCHA. Повторите попытку',
    'auth/missing-verification-code':'Введите код из SMS',
  };
  return map[code] ?? 'Произошла ошибка. Попробуйте ещё раз';
}

// ─── Стили ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex:            1,
    backgroundColor: COLORS.primary,
  },
  flex: { flex: 1 },
  scroll: {
    flexGrow:        1,
    justifyContent:  'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical:   SPACING.xl,
  },

  // Шапка
  header: {
    alignItems:    'center',
    marginBottom:  SPACING.xl,
  },
  logoCircle: {
    width:           80,
    height:          80,
    borderRadius:    40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent:  'center',
    alignItems:      'center',
    marginBottom:    SPACING.md,
  },
  logoEmoji: {
    fontSize: 38,
  },
  appTitle: {
    fontSize:    28,
    fontWeight:  '700',
    color:       COLORS.textInverse,
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize:   14,
    color:      'rgba(255,255,255,0.75)',
    marginTop:  SPACING.xs,
    letterSpacing: 0.3,
  },

  // Карточка
  card: {
    backgroundColor: COLORS.card,
    borderRadius:    RADIUS.xl,
    padding:         SPACING.lg,
    ...SHADOW.strong,
  },
  stepTitle: {
    fontSize:    20,
    fontWeight:  '700',
    color:       COLORS.text,
    marginBottom: SPACING.xs,
  },
  stepHint: {
    fontSize:    14,
    color:       COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight:  20,
  },
  phoneHighlight: {
    fontWeight: '600',
    color:      COLORS.primary,
  },

  // Поля ввода
  label: {
    fontSize:    13,
    fontWeight:  '600',
    color:       COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius:    RADIUS.md,
    borderWidth:     1.5,
    borderColor:     COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical:   Platform.OS === 'ios' ? 14 : 10,
    fontSize:          17,
    color:             COLORS.text,
    marginBottom:      SPACING.md,
  },
  codeInput: {
    fontSize:      28,
    letterSpacing: 10,
    textAlign:     'center',
    fontWeight:    '700',
  },

  // Кнопки
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius:    RADIUS.md,
    paddingVertical: 15,
    alignItems:      'center',
    marginTop:       SPACING.xs,
    ...SHADOW.card,
  },
  btnDisabled: {
    opacity: 0.55,
  },
  primaryBtnText: {
    color:       COLORS.textInverse,
    fontSize:    16,
    fontWeight:  '700',
    letterSpacing: 0.3,
  },
  resendBtn: {
    alignItems:  'center',
    marginTop:   SPACING.md,
    paddingVertical: SPACING.sm,
  },
  resendText: {
    color:    COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },

  // Назад
  backRow: {
    flexDirection: 'row',
    alignItems:    'center',
    marginBottom:  SPACING.md,
  },
  backArrow: {
    fontSize:    20,
    color:       COLORS.primary,
    marginRight: SPACING.xs,
  },
  backText: {
    fontSize:   14,
    color:      COLORS.primary,
    fontWeight: '500',
  },

  // Ошибка
  errorText: {
    color:        COLORS.error,
    fontSize:     13,
    marginBottom: SPACING.sm,
    lineHeight:   18,
  },

  // Подвал
  legalText: {
    textAlign:   'center',
    color:       'rgba(255,255,255,0.55)',
    fontSize:    12,
    marginTop:   SPACING.lg,
    lineHeight:  17,
    paddingHorizontal: SPACING.md,
  },
});
