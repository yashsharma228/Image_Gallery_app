"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Clock, TrendingUp, Sparkles, LayoutDashboard } from 'lucide-react';
import { imageAPI } from '@/lib/api';
import Header from '@/components/Header';
import ImageGrid from '@/components/ImageGrid';
import Loader from '@/components/Loader';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

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
      console.log('🔄 Fetching liked images...');
      const response = await imageAPI.getLikedImages(sort);
      console.log('✅ Liked images response:', response.data);
      setImages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('❌ Error fetching liked images:', error);
      // Show more detailed error if possible
      const errorMsg = error.response?.data?.message || error.message;
      console.error('Error detail:', errorMsg);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <Loader />;

  // Remove duplicate images by _id
  const uniqueImages = images.filter(
    (img, idx, arr) => arr.findIndex(i => i._id === img._id) === idx
  );

  const filteredImages = uniqueImages.filter(img =>
    img.title?.toLowerCase().includes(search.toLowerCase()) ||
    img.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Header user={user} onLogout={logout} search={search} setSearch={setSearch} />
      
      <main className="pb-20">
        {/* Collection Header */}
        <section className="relative pt-16 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-rose-100/50 via-transparent to-transparent dark:from-rose-900/20 pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-sm font-bold mb-8"
            >
              <Heart size={16} fill="currentColor" />
              <span>Personal Collection</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight"
            >
              Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">Favorites.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400 mb-10 font-medium"
            >
              A curated space for the moments that inspired you. Revisit your liked photography anytime.
            </motion.p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-6">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                My Collection
                <span className="text-sm bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500 font-bold">
                  {uniqueImages.length}
                </span>
              </h2>
              <div className="flex gap-2">
                {[
                  { id: 'newest', label: 'Recent', icon: Clock },
                  { id: 'popular', label: 'Popular', icon: TrendingUp },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setSort(id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      sort === id 
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' 
                        : 'bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          {!user ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-6">
                <Sparkles size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Sign in to save favorites</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto font-medium">
                Keep track of all the amazing photography you find. Start your collection today.
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-200 dark:shadow-none transition-all">
                Get Started
              </Link>
            </div>
          ) : loading && images.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/30 rounded-3xl flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto mb-6">
                <Heart size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Empty Collection</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto font-medium">
                You haven't liked any photos yet. Explore the gallery and fill your collection with inspiration.
              </p>
              <Link href="/" className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black shadow-xl transition-all">
                <LayoutDashboard size={18} />
                Explore Gallery
              </Link>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={sort + search}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ImageGrid images={filteredImages} user={user} onLikeChange={fetchLikedImages} />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}
