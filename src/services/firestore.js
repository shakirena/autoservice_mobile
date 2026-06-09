/**
 * Firestore — запросы для клиентского приложения (read-only)
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// normalizePhone/formatPhoneDisplay вынесены в чистый модуль phoneUtils (без зависимостей
// от react-native/firebase), чтобы их можно было покрыть unit-тестами сервисного слоя
// в изоляции (Story #4). Импортируем для внутреннего использования и одновременно
// реэкспортируем — для обратной совместимости внешних импортов (LoginScreen, HomeScreen).
import { normalizePhone, formatPhoneDisplay } from './phoneUtils';
export { normalizePhone, formatPhoneDisplay };

// ─── Профиль клиента ──────────────────────────────────────────────────────────

/**
 * Ищет профиль клиента в Firestore по UID или номеру телефона.
 * @returns {Object|null} данные клиента или null, если не найден в CRM
 */
export async function getClientProfile(uid, phoneNumber) {
  // Пробуем по UID (если CRM создаёт документ clients/{uid})
  const byUid = await getDoc(doc(db, 'clients', uid));
  if (byUid.exists()) {
    return { id: byUid.id, ...byUid.data() };
  }

  // Fallback: ищем по номеру телефона
  if (phoneNumber) {
    const normalized = normalizePhone(phoneNumber);
    const snap = await getDocs(
      query(collection(db, 'clients'), where('phone', '==', normalized))
    );
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() };
    }
  }

  return null;
}

// ─── Автомобили ───────────────────────────────────────────────────────────────

/**
 * Возвращает список автомобилей клиента.
 * @returns {Array<Object>}
 */
export async function getClientCars(uid) {
  const snap = await getDocs(
    query(
      collection(db, 'cars'),
      where('clientUid', '==', uid),
      orderBy('createdAt', 'desc')
    )
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── Заказы/Визиты ────────────────────────────────────────────────────────────

/**
 * Возвращает историю визитов по конкретному автомобилю.
 * @returns {Array<Object>}
 */
export async function getCarOrders(carId) {
  const snap = await getDocs(
    query(
      collection(db, 'orders'),
      where('carId', '==', carId),
      orderBy('date', 'desc')
    )
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Возвращает детали одного визита.
 * @returns {Object|null}
 */
export async function getOrderById(orderId) {
  const snap = await getDoc(doc(db, 'orders', orderId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ─── Утилиты ──────────────────────────────────────────────────────────────────
// normalizePhone / formatPhoneDisplay реэкспортированы выше из ./phoneUtils

/**
 * Форматирует метку статуса заказа
 */
export function getStatusMeta(status) {
  const map = {
    new:         { label: 'Новый',      color: 'info'    },
    in_progress: { label: 'В работе',   color: 'warning' },
    done:        { label: 'Завершён',   color: 'success' },
    completed:   { label: 'Завершён',   color: 'success' },
    waiting:     { label: 'Ожидает',    color: 'pending' },
    cancelled:   { label: 'Отменён',    color: 'error'   },
  };
  return map[status] ?? { label: status ?? 'Неизвестно', color: 'info' };
}

/**
 * Форматирует сумму в рубли
 */
export function formatPrice(amount) {
  if (!amount && amount !== 0) return '—';
  return new Intl.NumberFormat('ru-RU', {
    style:    'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Форматирует дату из Firestore Timestamp
 */
export function formatDate(timestamp) {
  if (!timestamp) return '—';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('ru-RU', {
    day:   'numeric',
    month: 'long',
    year:  'numeric',
  });
}

/**
 * Форматирует дату кратко (для карточки визита)
 */
export function formatDateShort(timestamp) {
  if (!timestamp) return '—';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('ru-RU', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  });
}
