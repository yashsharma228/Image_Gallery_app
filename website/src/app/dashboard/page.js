"use client";

import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import ImageGrid from '@/components/ImageGrid';
import Loader from '@/components/Loader';
import { imageAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [images, setImages] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, user?.id, sort]);

  const fetchImages = async () => {
    setFetching(true);
    try {
      const uid = user?._id || user?.id;
      const response = await imageAPI.getAll({ sort, userId: uid });
      setImages(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setImages([]);
    } finally {
      setFetching(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Header user={user} onLogout={logout} search={search} setSearch={setSearch} />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Dashboard Feed</h1>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white font-semibold text-gray-800 focus:outline-none focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {fetching ? (
            <Loader />
          ) : (
            <ImageGrid
              images={images.filter((img) => {
                const q = search.toLowerCase();
                return (
                  (img.title || '').toLowerCase().includes(q) ||
                  (img.description || '').toLowerCase().includes(q) ||
                  (img.uploadedBy?.name || '').toLowerCase().includes(q)
                );
              })}
              user={user}
              onLikeChange={fetchImages}
            />
          )}
        </div>
      </main>
    </>
  );
}
