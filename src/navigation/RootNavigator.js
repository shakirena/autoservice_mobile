/**
 * Корневой навигатор: Auth-gate.
 * Показывает LoginScreen или AppNavigator в зависимости от состояния.
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth }      from '../hooks/useAuth';
import LoginScreen      from '../screens/LoginScreen';
import AppNavigator     from './AppNavigator';
import { COLORS }       from '../config/theme';

export default function RootNavigator() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <AppNavigator onSignOut={signOut} />;
}

const styles = StyleSheet.create({
  splash: {
    flex:            1,
    justifyContent:  'center',
    alignItems:      'center',
    backgroundColor: COLORS.background,
  },
});
