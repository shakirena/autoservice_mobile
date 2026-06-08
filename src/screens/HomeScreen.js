/**
 * HomeScreen — список автомобилей клиента
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
import { useAuth }         from '../hooks/useAuth';
import { getClientCars, formatPhoneDisplay } from '../services/firestore';
import { COLORS, SPACING, RADIUS, SHADOW } from '../config/theme';

export default function HomeScreen({ navigation }) {
  const { user, clientProfile, notInCrm } = useAuth();

  const [cars,      setCars]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,     setError]     = useState('');

  const fetchCars = useCallback(async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true);
    setError('');
    try {
      const data = await getClientCars(user.uid);
      setCars(data);
    } catch (err) {
      console.error('[Home] fetchCars:', err);
      setError('Не удалось загрузить данные. Проверьте соединение.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCars(true);
  };

  const openHistory = (car) => {
    const carTitle = `${car.make} ${car.model} ${car.year ?? ''}`.trim();
    navigation.navigate('History', { carId: car.id, carTitle, car });
  };

  // ─── Имя клиента или номер телефона ─────────────────────────────────────────
  const greeting = clientProfile?.name
    ? `Добро пожаловать, ${clientProfile.name.split(' ')[0]}!`
    : `Добро пожаловать!`;

  const phoneDisplay = user?.phoneNumber
    ? formatPhoneDisplay(user.phoneNumber)
    : '';

  // ─── Рендер карточки автомобиля ──────────────────────────────────────────────
  const renderCar = ({ item: car, index }) => (
    <TouchableOpacity
      style={[styles.carCard, index === 0 && styles.carCardFirst]}
      onPress={() => openHistory(car)}
      activeOpacity={0.75}
    >
      <View style={styles.carIconWrap}>
        <Text style={styles.carIcon}>🚗</Text>
      </View>

      <View style={styles.carInfo}>
        <Text style={styles.carTitle} numberOfLines={1}>
          {car.make} {car.model}
        </Text>
        <Text style={styles.carSub}>
          {[car.year, car.color].filter(Boolean).join(' · ')}
        </Text>
        {!!car.licensePlate && (
          <View style={styles.plateBadge}>
            <Text style={styles.plateText}>{car.licensePlate}</Text>
          </View>
        )}
      </View>

      <View style={styles.chevronWrap}>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );

  // ─── Состояния ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Загрузка автомобилей...</Text>
      </View>
    );
  }

  if (notInCrm) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>Номер не зарегистрирован</Text>
        <Text style={styles.emptyText}>
          Номер {phoneDisplay} не найден в системе.{'\n'}
          Обратитесь на ресепшн автосервиса.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <FlatList
        data={cars}
        keyExtractor={(item) => item.id}
        renderItem={renderCar}
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
          <View style={styles.listHeader}>
            {/* Карточка клиента */}
            <View style={styles.profileCard}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {(clientProfile?.name ?? phoneDisplay).charAt(0).toUpperCase() || '👤'}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.greetingText}>{greeting}</Text>
                <Text style={styles.phoneText}>{phoneDisplay}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>
              {cars.length > 0
                ? `${cars.length} ${pluralCars(cars.length)}`
                : 'Автомобили'}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            {error
              ? <>
                  <Text style={styles.emptyIcon}>⚠️</Text>
                  <Text style={styles.emptyTitle}>Ошибка загрузки</Text>
                  <Text style={styles.emptyText}>{error}</Text>
                  <TouchableOpacity style={styles.retryBtn} onPress={() => fetchCars()}>
                    <Text style={styles.retryText}>Повторить</Text>
                  </TouchableOpacity>
                </>
              : <>
                  <Text style={styles.emptyIcon}>🚘</Text>
                  <Text style={styles.emptyTitle}>Автомобили не найдены</Text>
                  <Text style={styles.emptyText}>
                    Ваши автомобили появятся здесь после первого визита
                  </Text>
                </>
            }
          </View>
        }
      />
    </SafeAreaView>
  );
}

function pluralCars(n) {
  if (n % 10 === 1 && n % 100 !== 11) return 'автомобиль';
  if ([2,3,4].includes(n % 10) && ![12,13,14].includes(n % 100)) return 'автомобиля';
  return 'автомобилей';
}

// ─── Стили ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems:     'center',
    padding:        SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    color:     COLORS.textSecondary,
    fontSize:  15,
  },

  // Список
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom:     SPACING.xl,
  },
  listHeader: {
    paddingTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },

  // Профиль
  profileCard: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: COLORS.card,
    borderRadius:    RADIUS.lg,
    padding:         SPACING.md,
    marginBottom:    SPACING.lg,
    ...SHADOW.card,
  },
  avatarCircle: {
    width:           48,
    height:          48,
    borderRadius:    24,
    backgroundColor: COLORS.primary,
    justifyContent:  'center',
    alignItems:      'center',
    marginRight:     SPACING.md,
  },
  avatarText: {
    color:      COLORS.textInverse,
    fontSize:   20,
    fontWeight: '700',
  },
  profileInfo: { flex: 1 },
  greetingText: {
    fontSize:   16,
    fontWeight: '600',
    color:      COLORS.text,
  },
  phoneText: {
    fontSize:  13,
    color:     COLORS.textSecondary,
    marginTop: 2,
  },

  // Заголовок секции
  sectionTitle: {
    fontSize:      13,
    fontWeight:    '600',
    color:         COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom:  SPACING.sm,
    marginLeft:    SPACING.xs,
  },

  // Карточка авто
  carCard: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: COLORS.card,
    borderRadius:    RADIUS.lg,
    padding:         SPACING.md,
    marginBottom:    SPACING.sm,
    ...SHADOW.card,
  },
  carCardFirst: {},
  carIconWrap: {
    width:           52,
    height:          52,
    borderRadius:    RADIUS.md,
    backgroundColor: COLORS.infoBg,
    justifyContent:  'center',
    alignItems:      'center',
    marginRight:     SPACING.md,
  },
  carIcon: { fontSize: 26 },
  carInfo: { flex: 1 },
  carTitle: {
    fontSize:   17,
    fontWeight: '600',
    color:      COLORS.text,
    marginBottom: 2,
  },
  carSub: {
    fontSize: 13,
    color:    COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  plateBadge: {
    alignSelf:       'flex-start',
    backgroundColor: COLORS.cardAlt,
    borderRadius:    RADIUS.sm,
    borderWidth:     1,
    borderColor:     COLORS.border,
    paddingHorizontal: SPACING.sm,
    paddingVertical:   2,
  },
  plateText: {
    fontSize:      12,
    fontWeight:    '600',
    color:         COLORS.text,
    letterSpacing: 1,
  },
  chevronWrap: {
    paddingLeft: SPACING.sm,
  },
  chevron: {
    fontSize: 26,
    color:    COLORS.textLight,
    lineHeight: 30,
  },

  // Пустой / ошибка
  emptyWrap: {
    alignItems:  'center',
    paddingTop:  SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    fontSize:     48,
    marginBottom: SPACING.md,
  },
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
    marginTop:       SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius:    RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical:   SPACING.sm,
  },
  retryText: {
    color:      COLORS.textInverse,
    fontWeight: '600',
    fontSize:   15,
  },
});
