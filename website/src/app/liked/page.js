"use client";
import ImageGrid from '@/components/ImageGrid';
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
  const [search, setSearch] = useState("");

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


  // Remove duplicate images by _id
  const uniqueImages = images.filter(
    (img, idx, arr) => arr.findIndex(i => i._id === img._id) === idx
  );

  // Filter by search string (case-insensitive, on title/caption/description if available)
  const filteredImages = search.trim()
    ? uniqueImages.filter(img => {
        const haystack = [img.title, img.caption, img.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(search.trim().toLowerCase());
      })
    : uniqueImages;

  return (
    <>
      <Header user={user} onLogout={logout} search={search} setSearch={setSearch} />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Sorting Controls */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-bold text-white drop-shadow-lg outline outline-2 outline-slate-800 rounded px-4 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              ❤️ My Liked Images
            </h1>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="gradient-btn px-4 py-2 font-semibold focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
          {filteredImages.length === 0 ? (
            <div className="text-gray-400 text-center py-16">No liked images found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {filteredImages.map((img) => (
                <div key={img._id} className="flex justify-center items-center">
                  <div style={{ width: '320px', height: '240px' }} className="w-[320px] h-[240px]">
                    <ImageCard image={img} userId={user?._id} onLikeChange={fetchLikedImages} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
