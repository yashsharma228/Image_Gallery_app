'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreVertical, Eye, Calendar, User as UserIcon } from 'lucide-react';
import { imageAPI } from '@/lib/api';
import Image from 'next/image';
import ImageModal from './ImageModal';
import CommentSection from './CommentSection';

const ImageCard = ({ image, user, onLikeChange }) => {
  const [isLiked, setIsLiked] = useState(image.isLikedByUser || false);
  const [likeCount, setLikeCount] = useState(image.likeCount || 0);
  const [commentCount, setCommentCount] = useState(image.commentCount || 0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setIsLiked(!!image.isLikedByUser);
    setLikeCount(image.likeCount || 0);
    setCommentCount(image.commentCount || 0);
  }, [image]);

  const handleLike = async (e) => {
    if (e) e.stopPropagation();
    // Accept both user.id and user._id for compatibility
    const userId = user?._id || user?.id;
    if (!userId) {
      alert('Please sign in to like images! ❤️ (If you are signed in and still see this, please refresh the page or re-login.)');
      return;
    }
    
    setLoading(true);
    try {
      if (isLiked) {
        await imageAPI.unlikeImage(image._id);
        setLikeCount(prev => Math.max(0, prev - 1));
        setIsLiked(false);
      } else {
        await imageAPI.likeImage(image._id);
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
      }
      if (onLikeChange) onLikeChange();
    } catch (error) {
      console.error('Error updating like:', error);
      const msg = error.response?.data?.message || error.message || 'Failed to update like';
      alert(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <>
      <motion.div
        variants={item}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setShowModal(true)}
        className="break-inside-avoid group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 dark:border-slate-800 mb-8 cursor-pointer max-w-full w-full"
        style={{ minHeight: 420, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}
      >
        {/* Image Container - Masonry Style, No Crop */}
        <div className="relative overflow-hidden" style={{ minHeight: 320 }}>
          <motion.img
            src={image.url}
            alt={image.title}
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.4 }}
            className="w-full h-[320px] object-cover block bg-slate-100 dark:bg-slate-800"
            style={{ aspectRatio: image.width && image.height ? `${image.width} / ${image.height}` : 'auto' }}
          />
          

        </div>

        {/* Bottom Info - Large with actions */}
        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
              {image.title?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-[180px]">{image.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Photo</p>
            </div>
            <span className="ml-auto p-2 text-slate-400">{image.uploadedBy?.name || 'Anonymous'}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <button
              className={`flex items-center gap-1 px-4 py-2 rounded-xl font-bold text-base transition-all ${isLiked ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-500'}`}
              onClick={(e) => { e.stopPropagation(); handleLike(e); }}
              disabled={loading}
            >
              <Heart size={22} fill={isLiked ? 'currentColor' : 'none'} className={isLiked ? 'text-rose-500' : ''} />
              {likeCount}
            </button>
            <button
              className="flex items-center gap-1 px-4 py-2 rounded-xl font-bold text-base bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
              onClick={e => { e.stopPropagation(); setShowCommentBox(true); }}
            >
              <MessageCircle size={22} />
              {commentCount}
            </button>
            <button
              className="flex items-center gap-1 px-4 py-2 rounded-xl font-bold text-base bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
              onClick={e => { e.stopPropagation(); navigator.share ? navigator.share({ url: image.url, title: image.title }) : window.open(image.url, '_blank'); }}
            >
              <Share2 size={22} />
              Share
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <ImageModal 
            image={image} 
            user={user} 
            onClose={() => setShowModal(false)} 
            onLikeChange={onLikeChange}
            fullImage
          />
        )}
        {showCommentBox && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
              <button className="absolute top-2 right-2 text-slate-400 hover:text-rose-500" onClick={() => setShowCommentBox(false)}>&times;</button>
              <h2 className="text-lg font-bold mb-4">Comments</h2>
              {/* Actual comment UI */}
              <div>
                <CommentSection imageId={image._id} user={user} />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageCard;
