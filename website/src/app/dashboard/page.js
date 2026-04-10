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
      <main className="flex-1 flex flex-col items-center py-8">
        <div className="card p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-center text-white">Welcome, {user.name}!</h1>
          <p className="mb-2 text-center text-gray-300">Email: {user.email}</p>
          {user.profilePicture && (
            <div className="flex justify-center mb-4">
              <img src={user.profilePicture} alt="Profile" className="rounded-full w-24 h-24 border-4 border-accent-gradient1" />
            </div>
          )}
          <button
            className="gradient-btn w-full py-2 mt-2 font-semibold"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </main>
    </>
  );
}
