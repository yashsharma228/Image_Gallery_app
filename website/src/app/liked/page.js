'use client';

import { useState, useEffect } from 'react';
import { imageAPI } from '@/lib/api';
import Header from '@/components/Header';
import ImageCard from '@/components/ImageCard';
import Loader from '@/components/Loader';
import { useAuth } from '@/hooks/useAuth';

export default function LikedPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    if (user) {
      fetchLikedImages();
    } else {
      setImages([]);
      setLoading(false);
    }
  }, [sort, user]);

  const fetchLikedImages = async () => {
    setLoading(true);
    try {
      const response = await imageAPI.getLikedImages(sort);
      setImages(response.data);
    } catch (error) {
      console.error('Error fetching liked images:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (loading && images.length === 0)) {
    return <Loader />;
  }

  return (
    <>
      <Header user={user} onLogout={logout} />
      <main className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Sorting Controls */}
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">❤️ My Liked Images</h1>
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

          {/* Images Grid */}
          {images.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">You haven't liked any images yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => (
                <ImageCard
                  key={image._id}
                  image={image}
                  userId={user?.id}
                  onLikeChange={fetchLikedImages}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
