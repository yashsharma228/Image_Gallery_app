import { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { authService } from '@/lib/authService';

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initial session check and listener setup
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const userData = await authService.checkSession();
        if (isMounted && userData) {
          setUser(userData);
        }
      } catch (err) {
        console.error("Session check failed", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Always sync with backend to get the MongoDB user object with ID
          const idToken = await firebaseUser.getIdToken();
          const response = await authService.googleLogin(idToken);
          if (isMounted) {
            setUser(response.user);
          }
        } catch (error) {
          console.error('Login sync failed:', error);
          if (isMounted) setUser(null);
        }
      } else {
        if (isMounted) {
          setUser(null);
          // Don't call authService.logout() here automatically as it might 
          // clear cookies we still need during session checks
        }
      }
      if (isMounted) setLoading(false);
    });

    checkSession();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      await authService.logout();
      setUser(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  return { user, loading, logout };
};
