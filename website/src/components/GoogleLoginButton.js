'use client';

import { useState } from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { authService } from '@/lib/authService';
import { useRouter } from 'next/navigation';

const GoogleLoginButton = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      console.log('Firebase user logged in:', {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        picture: firebaseUser.photoURL
      });
      
      // 🔥 IMPORTANT: Get the Firebase ID token
      const idToken = await firebaseUser.getIdToken();
      
      // Send to backend to save user in MongoDB
      const response = await authService.googleLogin(idToken);
      
      console.log('User saved to MongoDB:', response.user);
      
      router.push('/');
    } catch (err) {
      setError(err.message || 'Login failed');
      console.error('Google login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto"
      >
        {loading ? 'Logging in...' : '🔐 Login with Google'}
      </button>
    </div>
  );
};

export default GoogleLoginButton;
