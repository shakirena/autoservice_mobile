/**
 * HistoryScreen — история визитов по выбранному автомобилю
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getCarOrders,
  getStatusMeta,
  formatPrice,
  formatDateShort,
} from '../services/firestore';
import { COLORS, SPACING, RADIUS, SHADOW } from '../config/theme';

export default function HistoryScreen({ navigation, route }) {
  const { carId, car } = route.params ?? {};

  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState('');

  const fetchOrders = useCallback(async (silent = false) => {
    if (!carId) return;
    if (!silent) setLoading(true);
    setError('');
    try {
      const data = await getCarOrders(carId);
      setOrders(data);
    } catch (err) {
      console.error('[History] fetchOrders:', err);
      setError('Не удалось загрузить историю. Проверьте соединение.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [carId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders(true);
  };

  const openDetail = (order) => {
    navigation.navigate('OrderDetail', { orderId: order.id, order, car });
  };

  // ─── Рендер карточки визита ──────────────────────────────────────────────────
  const renderOrder = ({ item: order }) => {
    const status    = getStatusMeta(order.status);
    const dateStr   = formatDateShort(order.date);
    const worksText = order.works?.length
      ? order.works.map(w => w.name).join(', ')
      : '—';

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => openDetail(order)}
        activeOpacity={0.75}
      >
        {/* Дата + статус */}
        <View style={styles.orderTopRow}>
          <Text style={styles.orderDate}>{dateStr}</Text>
          <StatusBadge color={status.color} label={status.label} />
        </View>

        {/* Узел */}
        {!!order.node && (
          <View style={styles.nodeRow}>
            <Text style={styles.nodeIcon}>⚙️</Text>
            <Text style={styles.nodeText}>{order.node}</Text>
          </View>
        )}

        {/* Работы — первые 2 */}
        <Text style={styles.worksText} numberOfLines={2}>
          {worksText}
        </Text>

        {/* Итог */}
        <View style={styles.orderFooter}>
          <Text style={styles.totalLabel}>Итого</Text>
          <Text style={styles.totalValue}>{formatPrice(order.totalAmount)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // ─── Состояния ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Загрузка истории...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListHeaderComponent={
          car ? (
            <View style={styles.carBanner}>
              <View style={styles.carBannerIcon}>
                <Text style={styles.carBannerEmoji}>🚗</Text>
              </View>
              <View>
                <Text style={styles.carBannerTitle}>
                  {car.make} {car.model} {car.year ?? ''}
                </Text>
                {!!car.licensePlate && (
                  <Text style={styles.carBannerPlate}>{car.licensePlate}</Text>
                )}
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            {error
              ? <>
                  <Text style={styles.emptyIcon}>⚠️</Text>
                  <Text style={styles.emptyTitle}>Ошибка загрузки</Text>
                  <Text style={styles.emptyText}>{error}</Text>
                  <TouchableOpacity style={styles.retryBtn} onPress={() => fetchOrders()}>
                    <Text style={styles.retryText}>Повторить</Text>
                  </TouchableOpacity>
                </>
              : <>
                  <Text style={styles.emptyIcon}>📋</Text>
                  <Text style={styles.emptyTitle}>Визитов пока нет</Text>
                  <Text style={styles.emptyText}>
                    История обслуживания появится после первого визита
                  </Text>
                </>
            }
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ─── Компонент: бейдж статуса ────────────────────────────────────────────────
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
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{label}</Text>
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
  loadingText: {
    marginTop: SPACING.md,
    color:     COLORS.textSecondary,
    fontSize:  15,
  },

  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom:     SPACING.xl,
    paddingTop:        SPACING.md,
  },

  // Баннер авто
  carBanner: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: COLORS.primary,
    borderRadius:    RADIUS.lg,
    padding:         SPACING.md,
    marginBottom:    SPACING.lg,
  },
  carBannerIcon: {
    width:           44,
    height:          44,
    borderRadius:    RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent:  'center',
    alignItems:      'center',
    marginRight:     SPACING.md,
  },
  carBannerEmoji: { fontSize: 22 },
  carBannerTitle: {
    fontSize:   16,
    fontWeight: '700',
    color:      COLORS.textInverse,
  },
  carBannerPlate: {
    fontSize:      12,
    color:         'rgba(255,255,255,0.75)',
    letterSpacing: 1,
    marginTop:     2,
  },

  // Карточка заказа
  orderCard: {
    backgroundColor: COLORS.card,
    borderRadius:    RADIUS.lg,
    padding:         SPACING.md,
    marginBottom:    SPACING.sm,
    ...SHADOW.card,
  },
  orderTopRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   SPACING.sm,
  },
  orderDate: {
    fontSize:   14,
    fontWeight: '600',
    color:      COLORS.text,
  },

  // Бейдж
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical:   3,
    borderRadius:      RADIUS.pill,
  },
  badgeText: {
    fontSize:   12,
    fontWeight: '600',
  },

  // Узел
  nodeRow: {
    flexDirection: 'row',
    alignItems:    'center',
    marginBottom:  SPACING.xs,
  },
  nodeIcon: {
    fontSize:    14,
    marginRight: SPACING.xs,
  },
  nodeText: {
    fontSize:   14,
    fontWeight: '600',
    color:      COLORS.primary,
  },

  // Работы
  worksText: {
    fontSize:     13,
    color:        COLORS.textSecondary,
    lineHeight:   18,
    marginBottom: SPACING.sm,
  },

  // Итог
  orderFooter: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    paddingTop:     SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    marginTop:      SPACING.xs,
  },
  totalLabel: {
    fontSize: 13,
    color:    COLORS.textSecondary,
  },
  totalValue: {
    fontSize:   16,
    fontWeight: '700',
    color:      COLORS.text,
  },

  // Пустой
  emptyWrap: {
    alignItems:        'center',
    paddingTop:        SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon:  { fontSize: 48, marginBottom: SPACING.md },
  emptyTitle: {
    fontSize:     18,
    fontWeight:   '600',
    color:        COLORS.text,
    textAlign:    'center',
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize:  14,
    color:     COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    marginTop:         SPACING.lg,
    backgroundColor:   COLORS.primary,
    borderRadius:      RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical:   SPACING.sm,
  },
  retryText: {
    color:      COLORS.textInverse,
    fontWeight: '600',
    fontSize:   15,
  },
});
