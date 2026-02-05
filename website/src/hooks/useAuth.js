import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { authService } from '@/lib/authService';

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initial session check
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const userData = await authService.checkSession();
        if (userData) {
          setUser(userData);
        }
      } catch (err) {
        console.error("Session check failed", err);
      } finally {
        setLoading(false);
      }
    };
    checkUserSession();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // If we already have a user from session check, we are good.
          // But if we just logged in via Firebase (e.g. pop-up), we need to sync with backend
          if (!user) {
             const idToken = await firebaseUser.getIdToken();
             const response = await authService.googleLogin(idToken);
             setUser(response.user);
          }
        } catch (error) {
          console.error('Login failed:', error);
          setUser(null);
        }
      } else {
        // Firebase logout -> ensure backend logout
        // Only if we previously had a user (to avoid double calls on initial load)
        if (user) {
          setUser(null);
          await authService.logout(); 
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [user]); // Add user as dependency so we know when to trigger logout logic properly

  const logout = async () => {
    try {
      // Sign out from Firebase first (removes Firebase session)
      await signOut(auth);
    } catch (error) {
      console.error('Firebase signout error:', error);
    } finally {
      // Always clear local storage and user data
      authService.logout();
      // Clear user state
      setUser(null);
      // Force redirect to login page with full page reload
      // This ensures all state is cleared and Firebase auth state is reset
      window.location.href = '/login';
    }
  };

  return { user, loading, logout };
};
