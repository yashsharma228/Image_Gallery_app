"use client";

import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Loader from '@/components/Loader';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Header user={user} onLogout={logout} />
      <main className="bg-gray-50 min-h-screen py-8 flex flex-col items-center">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-center">Welcome, {user.name}!</h1>
          <p className="mb-2 text-center">Email: {user.email}</p>
          {user.profilePicture && (
            <div className="flex justify-center mb-4">
              <img src={user.profilePicture} alt="Profile" className="rounded-full w-24 h-24" />
            </div>
          )}
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </main>
    </>
  );
}
