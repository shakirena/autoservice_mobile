/**
 * Навигация авторизованной зоны: Home → History → OrderDetail
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../config/theme';
import HomeScreen        from '../screens/HomeScreen';
import HistoryScreen     from '../screens/HistoryScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator({ onSignOut }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle:         { backgroundColor: COLORS.primary },
        headerTintColor:     COLORS.textInverse,
        headerTitleStyle:    { fontWeight: '600', fontSize: 17 },
        headerBackTitleVisible: false,
        contentStyle:        { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen
        name="Home"
        options={({ navigation }) => ({
          title: 'Мои автомобили',
          headerRight: () => (
            <TouchableOpacity onPress={onSignOut} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Выйти</Text>
            </TouchableOpacity>
          ),
        })}
      >
        {(props) => <HomeScreen {...props} />}
      </Stack.Screen>

      <Stack.Screen
        name="History"
        options={({ route }) => ({
          title: route.params?.carTitle ?? 'История обслуживания',
        })}
        component={HistoryScreen}
      />

      <Stack.Screen
        name="OrderDetail"
        options={{ title: 'Детали визита' }}
        component={OrderDetailScreen}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  logoutBtn: {
    paddingHorizontal: 4,
    paddingVertical:   4,
  },
  logoutText: {
    color:    COLORS.textInverse,
    fontSize: 15,
    opacity:  0.85,
  },
});
