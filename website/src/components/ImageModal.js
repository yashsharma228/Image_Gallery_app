import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User as UserIcon, Heart, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import CommentSection from './CommentSection';
import { imageAPI } from '@/lib/api';

export default function ImageModal({ image, user, onClose, onLikeChange }) {
  const [isLiked, setIsLiked] = useState(image.isLikedByUser || false);
  const [likeCount, setLikeCount] = useState(image.likeCount || 0);
  const [commentCount, setCommentCount] = useState(image.commentCount || 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsLiked(!!image.isLikedByUser);
    setLikeCount(image.likeCount || 0);
    setCommentCount(image.commentCount || 0);
  }, [image]);

  const handleLike = async (e) => {
    if (e) e.stopPropagation();
    if (!user?._id && !user?.id) return;
    
    setLoading(true);
    try {
      if (isLiked) {
        await imageAPI.unlikeImage(image._id);
        setLikeCount(Math.max(0, likeCount - 1));
        setIsLiked(false);
      } else {
        await imageAPI.likeImage(image._id);
        setLikeCount(likeCount + 1);
        setIsLiked(true);
      }
      onLikeChange?.();
    } catch (error) {
      console.error('Error updating like:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentChange = (count) => {
    setCommentCount(count);
    // Ideally we'd have a way to notify the parent ImageCard about this change too
    // but onLikeChange is currently used to refresh the whole grid in some places.
    // If we want a smoother experience, we'd need a more robust state management.
  };

  if (!image) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row border border-white/10"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-all"
        >
          <X size={24} />
        </button>

        {/* Image Section */}
        <div className="md:w-3/5 bg-slate-100 dark:bg-slate-800 relative min-h-[300px] md:min-h-[500px] flex items-center justify-center">
          <img
            src={image.url}
            alt={image.title}
            className="max-w-full max-h-full object-contain"
            style={{ position: 'relative', width: '100%', height: '100%' }}
          />
        </div>

        {/* Details Section */}
        <div className="md:w-2/5 flex flex-col h-full bg-white dark:bg-slate-900 overflow-y-auto custom-scrollbar">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-800">
                {image.uploadedBy?.avatar ? (
                  <img src={image.uploadedBy.avatar} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <UserIcon size={24} className="text-indigo-600 dark:text-indigo-400" />
                )}
              </div>
              <div>
                <h4 className="font-black text-slate-900 dark:text-white leading-tight">
                  {image.uploadedBy?.name || 'Anonymous'}
                </h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Creator</p>
              </div>
            </div>

            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
              {image.title}
            </h2>
            
            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed font-medium">
              {image.description || 'No description provided for this masterpiece.'}
            </p>

            <div className="flex items-center gap-6 mb-10 pb-8 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Uploaded</span>
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black">
                  <Calendar size={16} className="text-indigo-500" />
                  {new Date(image.uploadedDate).toLocaleDateString()}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Engagement</span>
                <div className="flex items-center gap-4 text-slate-900 dark:text-white font-black">
                  <button 
                    onClick={handleLike}
                    disabled={loading || (!user?._id && !user?.id)}
                    className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-rose-500' : 'hover:text-rose-500'}`}
                  >
                    <Heart size={16} fill={isLiked ? "currentColor" : "none"} /> 
                    {likeCount}
                  </button>
                  <span className="flex items-center gap-1.5 text-indigo-500">
                    <MessageCircle size={16} /> 
                    {commentCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-6">
              <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Discussion</h5>
              <CommentSection imageId={image._id} user={user} onCommentChange={handleCommentChange} />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
