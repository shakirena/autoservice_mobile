/**
 * Firebase инициализация
 *
 * Инициализируем два слоя:
 *  1. Modular API  (firebase/app, firebase/auth, firebase/firestore) — для нашего кода
 *  2. Compat API   (firebase/compat/app, firebase/compat/auth)       — для expo-firebase-recaptcha
 *
 * На Web: используем browserLocalPersistence
 * На iOS/Android: используем getReactNativePersistence(AsyncStorage)
 */

import { Platform } from 'react-native';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage    from '@react-native-async-storage/async-storage';

// Compat API — нужен expo-firebase-recaptcha
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

// ─── Конфиг ──────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// ─── Modular init ─────────────────────────────────────────────────────────────
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ─── Compat init (для expo-firebase-recaptcha) ────────────────────────────────
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// ─── Auth c платформо-зависимой персистентностью ──────────────────────────────
let auth;
try {
  if (Platform.OS === 'web') {
    // На web AsyncStorage недоступен — используем браузерный LocalStorage
    auth = initializeAuth(app, { persistence: browserLocalPersistence });
  } else {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
} catch {
  // Auth уже был инициализирован (Fast Refresh / hot reload)
  auth = getAuth(app);
}

// ─── Firestore ────────────────────────────────────────────────────────────────
const db = getFirestore(app);

export { app, auth, db };
