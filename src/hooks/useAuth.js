/**
 * Хук: состояние аутентификации + профиль клиента из Firestore
 */

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getClientProfile } from '../services/firestore';

/**
 * @returns {{
 *   user:          import('firebase/auth').User | null,
 *   clientProfile: Object | null,
 *   loading:       boolean,
 *   notInCrm:      boolean,   — авторизован, но нет в CRM
 *   signOut:       () => Promise<void>,
 * }}
 */
export function useAuth() {
  const [user,          setUser]          = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [notInCrm,      setNotInCrm]      = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getClientProfile(
            firebaseUser.uid,
            firebaseUser.phoneNumber
          );
          setUser(firebaseUser);
          setClientProfile(profile);
          setNotInCrm(profile === null);
        } catch (err) {
          console.error('[useAuth] Firestore error:', err);
          setUser(firebaseUser);
          setClientProfile(null);
          setNotInCrm(false); // не блокируем — покажем пустой экран
        }
      } else {
        setUser(null);
        setClientProfile(null);
        setNotInCrm(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return { user, clientProfile, loading, notInCrm, signOut };
}
