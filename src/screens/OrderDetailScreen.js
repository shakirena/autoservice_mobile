/**
 * OrderDetailScreen — детали одного визита
 * (узел, работы, стоимость каждой, итого, дата, мастер, пробег, примечания)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getOrderById,
  getStatusMeta,
  formatPrice,
  formatDate,
} from '../services/firestore';
import { COLORS, SPACING, RADIUS, SHADOW } from '../config/theme';

export default function OrderDetailScreen({ route }) {
  const { orderId, order: preloaded, car } = route.params ?? {};

  const [order,   setOrder]   = useState(preloaded ?? null);
  const [loading, setLoading] = useState(!preloaded);
  const [error,   setError]   = useState('');

  // Догружаем, если пришли без order (например, из deep link)
  useEffect(() => {
    if (preloaded || !orderId) return;
    setLoading(true);
    getOrderById(orderId)
      .then(data => {
        if (data) setOrder(data);
        else      setError('Визит не найден');
      })
      .catch(() => setError('Не удалось загрузить данные'))
      .finally(() => setLoading(false));
  }, [orderId, preloaded]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error || 'Данные не найдены'}</Text>
      </View>
    );
  }

  const status   = getStatusMeta(order.status);
  const works    = order.works ?? [];
  const dateStr  = formatDate(order.date);

  // Подсчёт итога из списка работ (или берём готовое поле)
  const worksTotal = works.reduce((sum, w) => sum + (w.price ?? 0), 0);
  const total      = order.totalAmount ?? worksTotal;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Шапка визита ───────────────────────────────────────────── */}
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            <Text style={styles.heroDate}>{dateStr}</Text>
            <StatusBadge color={status.color} label={status.label} />
          </View>
          {!!order.node && (
            <View style={styles.nodeRow}>
              <Text style={styles.nodeIcon}>⚙️</Text>
              <Text style={styles.nodeName}>{order.node}</Text>
            </View>
          )}
        </View>

        {/* ── Автомобиль ─────────────────────────────────────────────── */}
        {car && (
          <Section title="Автомобиль" icon="🚗">
            <Row
              label="Марка и модель"
              value={`${car.make} ${car.model}`}
            />
            {!!car.year         && <Row label="Год выпуска"  value={String(car.year)} />}
            {!!car.licensePlate && <Row label="Гос. номер"   value={car.licensePlate} mono />}
            {!!car.vin          && <Row label="VIN"          value={car.vin} mono />}
          </Section>
        )}

        {/* ── Выполненные работы ─────────────────────────────────────── */}
        <Section title="Выполненные работы" icon="🔧">
          {works.length > 0
            ? <>
                {works.map((w, i) => (
                  <View key={i} style={styles.workRow}>
                    <Text style={styles.workName} numberOfLines={2}>{w.name}</Text>
                    {w.price != null && (
                      <Text style={styles.workPrice}>{formatPrice(w.price)}</Text>
                    )}
                  </View>
                ))}
                {/* Разделитель */}
                <View style={styles.totalDivider} />
                <View style={[styles.workRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>ИТОГО</Text>
                  <Text style={styles.totalValue}>{formatPrice(total)}</Text>
                </View>
              </>
            : <Text style={styles.noDataText}>Список работ не указан</Text>
          }
        </Section>

        {/* ── Итог (если нет списка работ, но есть сумма) ──────────── */}
        {works.length === 0 && total > 0 && (
          <Section title="Стоимость" icon="💰">
            <View style={[styles.workRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>ИТОГО</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>
          </Section>
        )}

        {/* ── Дополнительная информация ──────────────────────────────── */}
        {(order.mileage || order.mechanicName || order.notes) ? (
          <Section title="Дополнительно" icon="📝">
            {!!order.mileage      && <Row label="Пробег"  value={`${order.mileage.toLocaleString('ru-RU')} км`} />}
            {!!order.mechanicName && <Row label="Мастер"  value={order.mechanicName} />}
            {!!order.notes        && (
              <View style={styles.notesWrap}>
                <Text style={styles.rowLabel}>Примечания</Text>
                <Text style={styles.notesText}>{order.notes}</Text>
              </View>
            )}
          </Section>
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Вспомогательные компоненты ───────────────────────────────────────────────

function Section({ title, icon, children }) {
  return (
    <View style={sectionStyles.wrap}>
      <View style={sectionStyles.header}>
        <Text style={sectionStyles.icon}>{icon}</Text>
        <Text style={sectionStyles.title}>{title}</Text>
      </View>
      <View style={sectionStyles.body}>{children}</View>
    </View>
  );
}

function Row({ label, value, mono = false }) {
  return (
    <View style={rowStyles.wrap}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={[rowStyles.value, mono && rowStyles.mono]} numberOfLines={2}>
        {value ?? '—'}
      </Text>
    </View>
  );
}

function StatusBadge({ color, label }) {
  const badgeColors = {
    success: { bg: COLORS.successBg, text: COLORS.success },
    warning: { bg: COLORS.warningBg, text: COLORS.warning },
    error:   { bg: COLORS.errorBg,   text: COLORS.error   },
    info:    { bg: COLORS.infoBg,    text: COLORS.info    },
    pending: { bg: COLORS.pendingBg, text: COLORS.pending },
  };
  const c = badgeColors[color] ?? badgeColors.info;
  return (
    <View style={[badgeStyles.badge, { backgroundColor: c.bg }]}>
      <Text style={[badgeStyles.text, { color: c.text }]}>{label}</Text>
    </View>
  );
}

// ─── Стили ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex:            1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex:           1,
    justifyContent: 'center',
    alignItems:     'center',
    padding:        SPACING.xl,
  },
  errorIcon: { fontSize: 40, marginBottom: SPACING.md },
  errorText: {
    color:     COLORS.error,
    fontSize:  15,
    textAlign: 'center',
  },
  scroll: {
    paddingHorizontal: SPACING.md,
    paddingTop:        SPACING.md,
  },

  // Шапка
  heroCard: {
    backgroundColor: COLORS.card,
    borderRadius:    RADIUS.lg,
    padding:         SPACING.md,
    marginBottom:    SPACING.md,
    ...SHADOW.card,
  },
  heroRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   SPACING.sm,
  },
  heroDate: {
    fontSize:   18,
    fontWeight: '700',
    color:      COLORS.text,
  },
  nodeRow: {
    flexDirection: 'row',
    alignItems:    'center',
  },
  nodeIcon: {
    fontSize:    16,
    marginRight: SPACING.xs,
  },
  nodeName: {
    fontSize:   16,
    fontWeight: '600',
    color:      COLORS.primary,
  },

  // Работы
  workRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  workName: {
    flex:      1,
    fontSize:  14,
    color:     COLORS.text,
    marginRight: SPACING.md,
    lineHeight: 20,
  },
  workPrice: {
    fontSize:   14,
    fontWeight: '600',
    color:      COLORS.text,
  },
  totalDivider: {
    height:          2,
    backgroundColor: COLORS.border,
    marginVertical:  SPACING.xs,
    borderRadius:    1,
  },
  totalRow: {
    borderBottomWidth: 0,
    paddingTop:        SPACING.sm,
  },
  totalLabel: {
    fontSize:      14,
    fontWeight:    '700',
    color:         COLORS.text,
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize:   20,
    fontWeight: '800',
    color:      COLORS.primary,
  },
  noDataText: {
    color:   COLORS.textLight,
    fontSize: 14,
    fontStyle: 'italic',
  },

  // Примечания
  notesWrap: {
    paddingVertical: SPACING.sm,
  },
  rowLabel: {
    fontSize:      12,
    fontWeight:    '600',
    color:         COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom:  SPACING.xs,
  },
  notesText: {
    fontSize:  14,
    color:     COLORS.text,
    lineHeight: 20,
  },
  bottomSpacer: { height: SPACING.xl },
});

const sectionStyles = StyleSheet.create({
  wrap: {
    backgroundColor: COLORS.card,
    borderRadius:    RADIUS.lg,
    marginBottom:    SPACING.md,
    overflow:        'hidden',
    ...SHADOW.card,
  },
  header: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: COLORS.cardAlt,
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  icon:  { fontSize: 15, marginRight: SPACING.sm },
  title: {
    fontSize:      13,
    fontWeight:    '700',
    color:         COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  body: {
    paddingHorizontal: SPACING.md,
    paddingBottom:     SPACING.xs,
  },
});

const rowStyles = StyleSheet.create({
  wrap: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  label: {
    fontSize: 13,
    color:    COLORS.textSecondary,
    flex:     1,
  },
  value: {
    fontSize:   14,
    fontWeight: '500',
    color:      COLORS.text,
    flex:       2,
    textAlign:  'right',
  },
  mono: {
    fontFamily:    Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.5,
    fontSize:      13,
  },
});

const badgeStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical:   4,
    borderRadius:      RADIUS.pill,
  },
  text: {
    fontSize:   12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
