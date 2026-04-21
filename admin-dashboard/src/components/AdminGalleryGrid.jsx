import { motion } from 'framer-motion';
import { MoreVertical, Heart, MessageCircle, Eye, Trash2, Edit } from 'lucide-react';
import { useState } from 'react';

export default function AdminGalleryGrid({ images }) {
  const [hoveredId, setHoveredId] = useState(null);

  const validImages = images.filter(img => {
    const isReactElement = val => val && typeof val === 'object' && val.$$typeof;
    if (isReactElement(img.title) || isReactElement(img.url)) return false;
    return typeof img.title === 'string' && typeof img.url === 'string';
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
    >
      {validImages.map(img => (
        <motion.div 
          key={img._id} 
          variants={item}
          onMouseEnter={() => setHoveredId(img._id)}
          onMouseLeave={() => setHoveredId(null)}
          className="break-inside-avoid group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800 mb-6"
        >
          {/* Image Container - Natural Aspect Ratio */}
          <div className="relative overflow-hidden">
            <motion.img
              src={img.url}
              alt={img.title}
              animate={{ scale: hoveredId === img._id ? 1.05 : 1 }}
              transition={{ duration: 0.4 }}
              className="w-full h-auto block"
            />
            
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveredId === img._id ? 1 : 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col justify-between p-4"
            >
              <div className="flex justify-end gap-2">
                <button className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors">
                  <Edit size={18} />
                </button>
                <button className="p-2 bg-rose-500/20 hover:bg-rose-500/40 backdrop-blur-md rounded-full text-white transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <h3 className="text-white font-bold text-lg line-clamp-1">{img.title}</h3>
                <div className="flex items-center gap-4 text-white/90 text-sm">
                  <span className="flex items-center gap-1.5"><Heart size={16} /> {img.likes?.length || 0}</span>
                  <span className="flex items-center gap-1.5"><MessageCircle size={16} /> {img.comments?.length || 0}</span>
                  <span className="flex items-center gap-1.5"><Eye size={16} /> {img.views || 0}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Info (Always Visible) */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                {img.title.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">{img.title}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Photo</p>
              </div>
            </div>
            <button className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
