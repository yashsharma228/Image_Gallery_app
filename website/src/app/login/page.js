'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Header from '@/components/Header';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { authService } from '@/lib/authService';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { logout } = useAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const storedUser = authService.getUser();
        setUser(storedUser);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <>
      <Header user={user} onLogout={logout} />

      <main className="bg-gradient-to-b from-blue-50 to-purple-50 min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
              🖼️ Welcome to Image Gallery
            </h1>
            <p className="text-center text-gray-600 mb-8">
              Sign in with your Google account to like images and create your personal collection.
            </p>

            <GoogleLoginButton />

            <div className="mt-8 space-y-4 text-sm text-gray-600">
              <h2 className="font-semibold text-gray-800 text-center">What you can do:</h2>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span>✨</span>
                  <span>Browse beautiful image collections</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>❤️</span>
                  <span>Like your favorite images</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>📚</span>
                  <span>View all your liked images in one place</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>🔍</span>
                  <span>Sort images by newest, oldest, or popularity</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
