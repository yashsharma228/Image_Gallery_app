'use client';

import { useState, useEffect } from 'react';
import { imageAPI } from '@/lib/api';
import Header from '@/components/Header';
import ImageCard from '@/components/ImageCard';
import Loader from '@/components/Loader';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user, loading: authLoading, logout } = useAuth();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('newest');
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    fetchImages();
  }, [sort, user?.id]);

  const fetchImages = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const response = await imageAPI.getAll({ sort, userId: user?.id });
      const data = Array.isArray(response.data) ? response.data : [];
      setImages(data);
    } catch (error) {
      console.error('Error fetching images:', error);
      setImages([]);
      setFetchError(error.response?.data?.message || error.message || 'Failed to load images. Check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Show loader only for initial auth check, not for images
  if (authLoading) {
    return <Loader />;
  }

  return (
    <>
      <Header user={user} onLogout={logout} />
      <main className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Login Prompt - Show prominently at top if not logged in */}
          {!user && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg mb-8 shadow-lg">
              <h2 className="text-3xl font-bold mb-4 text-center">Welcome to Image Gallery! 🖼️</h2>
              <p className="text-center mb-6 text-lg">
                Sign in with Google to like images and view your personal collection.
              </p>
              <div className="flex justify-center">
                <GoogleLoginButton />
              </div>
            </div>
          )}

          {/* Sorting Controls */}
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Image Gallery</h1>
            {images.length > 0 && (
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white font-semibold text-gray-800 focus:outline-none focus:border-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
              </select>
            )}
          </div>

          {/* Error message */}
          {fetchError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <p className="font-semibold">⚠️ {fetchError}</p>
              <p className="text-sm mt-1">Ensure backend is running at http://localhost:5000</p>
              <button
                onClick={fetchImages}
                className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded font-semibold"
              >
                Retry
              </button>
            </div>
          )}

          {/* Images Grid */}
          {loading ? (
            <div className="text-center py-12">
              <Loader />
            </div>
          ) : images.length === 0 && !fetchError ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No images available yet.</p>
              {!user && (
                <p className="text-gray-400 text-sm mt-2">Sign in to upload and manage images (admin only).</p>
              )}
            </div>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => (
                <ImageCard
                  key={image._id}
                  image={image}
                  userId={user?.id}
                  onLikeChange={fetchImages}
                />
              ))}
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}
