'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Clock } from 'lucide-react';
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
  }, [sort, user]);

  const fetchImages = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const userId = user?._id || user?.id;
      const response = await imageAPI.getAll({ 
        sort, 
        userId: userId // Pass userId to get isLikedByUser status
      });
      setImages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setImages([]);
      setFetchError(error.response?.data?.message || error.message || 'Failed to load images.');
    } finally {
      setLoading(false);
    }
  };

  const safeImages = Array.isArray(images) ? images : [];
  const filteredImages = safeImages.filter(img =>
    img.title?.toLowerCase().includes(search.toLowerCase()) ||
    img.description?.toLowerCase().includes(search.toLowerCase()) ||
    img.uploadedBy?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Header user={user} onLogout={logout} search={search} setSearch={setSearch} />
      
      <main className="pb-20">
        {/* Hero Section */}
        <section className="relative pt-16 pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/50 via-transparent to-transparent dark:from-indigo-900/20 pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-bold mb-8"
            >
              <Sparkles size={16} />
              <span>Discover the world's best photography</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tight"
            >
              Discover. Like. <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Connect.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400 mb-10 font-medium"
            >
              Discover images shared by admins, like what inspires you, and join the conversation through comments.
            </motion.p>

            {!user && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center gap-4"
              >
                <GoogleLoginButton />
                <p className="text-sm text-slate-400">Join 10,000+ photographers today</p>
              </motion.div>
            )}
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-6">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Feed</h2>
              <div className="flex gap-2">
                {[
                  { id: 'newest', label: 'Newest', icon: Clock },
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
            {/* Filters button removed */}
          </div>

          {/* Error State */}
          {fetchError && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-12 p-6 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-3xl text-center"
            >
              <p className="text-rose-600 dark:text-rose-400 font-bold mb-2">Oops! Something went wrong</p>
              <p className="text-sm text-rose-500/80 mb-6">{fetchError}</p>
              <button
                onClick={fetchImages}
                className="px-6 py-2 bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-200 dark:shadow-none hover:bg-rose-700 transition-all"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {/* Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={sort + search}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-[4/5] bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <ImageGrid images={filteredImages} user={user} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// ...existing code...
    
