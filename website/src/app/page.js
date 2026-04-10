'use client';

import { useState, useEffect } from 'react';
import { imageAPI } from '@/lib/api';
import Header from '@/components/Header';
import ImageGrid from '@/components/ImageGrid';
import Loader from '@/components/Loader';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { useAuth } from '@/hooks/useAuth';


export default function Home() {
  const { user, loading: authLoading, logout } = useAuth();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('newest');
  const [fetchError, setFetchError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line
  }, [sort, user?.id]);

  const fetchImages = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const response = await imageAPI.getAll({ sort, userId: user?.id });
      setImages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setImages([]);
      setFetchError(error.response?.data?.message || error.message || 'Failed to load images. Check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Filter images by search
  const filteredImages = images.filter(img =>
    img.title?.toLowerCase().includes(search.toLowerCase()) ||
    img.description?.toLowerCase().includes(search.toLowerCase()) ||
    img.uploadedBy?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading) {
    return <Loader />;
  }

  return (
    <>
      <Header user={user} onLogout={logout} search={search} setSearch={setSearch} />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Login Prompt - Show prominently at top if not logged in */}
          {!user && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg mb-8 shadow-lg">
              <h2 className="text-3xl font-extrabold mb-4 text-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">Welcome to Framely! 🖼️</h2>
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
            {/* Framely heading removed as requested */}
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

          {loading ? (
            <Loader />
          ) : (
            <ImageGrid images={filteredImages} userId={user?.id} onLikeChange={fetchImages} />
          )}
        </div>
      </main>
    </>
  );
}
    
