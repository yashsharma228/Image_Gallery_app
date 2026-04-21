import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ChevronRight } from 'lucide-react';
import AdminHeader from './AdminHeader';
import AdminTabs from './AdminTabs';
import AdminGalleryGrid from './AdminGalleryGrid';

export default function AdminDashboardPage({ images, user }) {
  const [tab, setTab] = useState('recent');
  const [search, setSearch] = useState('');

  // Filter images by tab and search
  const filteredImages = images.filter(img => {
    const matchesSearch = img.title?.toLowerCase().includes(search.toLowerCase());
    // Basic tab logic - can be expanded
    return matchesSearch;
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300"
    >
      <AdminHeader user={user} search={search} setSearch={setSearch} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <nav className="flex items-center space-x-2 text-sm text-slate-400 mb-2">
            <span className="hover:text-indigo-500 cursor-pointer transition-colors">Framely</span>
            <ChevronRight size={14} />
            <span className="text-indigo-600 font-medium">Dashboard</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-lg text-white">
                  <Camera size={24} />
                </div>
                Photo Management
              </h1>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Manage and organize your gallery assets effortlessly.
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
            >
              Upload New
            </motion.button>
          </div>
        </motion.div>

        <AdminTabs tab={tab} setTab={setTab} />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <AdminGalleryGrid images={filteredImages} />
          </motion.div>
        </AnimatePresence>
      </main>
    </motion.div>
  );
}
