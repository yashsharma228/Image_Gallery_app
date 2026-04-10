'use client';

import { useState, useEffect } from 'react';
import { imageAPI } from '@/lib/api';
import Image from 'next/image';
import CommentSection from './CommentSection';
import ImageModal from './ImageModal';

const ImageCard = ({ image, userId, onLikeChange }) => {
  const [isLiked, setIsLiked] = useState(image.isLikedByUser || false);
  const [likeCount, setLikeCount] = useState(image.likeCount || 0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleLike = async () => {
    if (!userId) return;
    
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

  return (
    <>
      <div className="rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 group relative cursor-pointer" onClick={() => setShowModal(true)}>
      {/* Admin info */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <img
          src={image.uploadedBy?.avatar || '/admin-avatar.png'}
          alt={image.uploadedBy?.name || 'Admin'}
          className="w-8 h-8 rounded-full border object-cover"
        />
        <span className="font-semibold text-slate-800 dark:text-slate-100">{image.uploadedBy?.name || 'Admin'}</span>
      </div>
      {/* Image with overlay */}
      <div className="relative w-full h-64 bg-slate-100 dark:bg-slate-900">
        <img
          src={image.url}
          alt={image.title}
          className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105 group-hover:shadow-2xl"
        />
        {/* Overlay actions */}
        <div className="absolute inset-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 p-4">
          <div className="flex gap-2 mb-2">
            <button
              onClick={handleLike}
              disabled={!userId || loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold shadow-lg focus:outline-none transition-all duration-200 backdrop-blur bg-white/80 dark:bg-slate-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-100 dark:border-indigo-900 ${isLiked ? 'text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}
            >
              {isLiked ? '❤️ Liked' : '🤍 Like'}
              <span className="ml-2">{likeCount}</span>
            </button>
            {/* Add more overlay actions here if needed */}
          </div>
        </div>
      </div>
      <div className="p-4">
        {/* Title and date */}
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 truncate mb-1">{image.title}</h3>
        <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mb-2">
          <span>📅 {new Date(image.uploadedDate).toLocaleDateString()}</span>
        </div>
        {/* Description */}
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate mb-2">{image.description || 'No description'}</p>
      </div>
      {showModal && (
        <ImageModal image={image} onClose={e => { e?.stopPropagation?.(); setShowModal(false); }}>
          <div className="flex flex-col md:flex-row gap-6">
            <img src={image.url} alt={image.title} className="w-full md:w-72 h-auto rounded-xl object-cover" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{image.title}</h2>
              <div className="mb-2 text-gray-500 text-sm">Uploaded by: <span className="font-semibold">{image.uploadedBy?.name || 'Admin'}</span></div>
              <div className="mb-2 text-gray-500 text-sm">Date: {new Date(image.uploadedDate).toLocaleDateString()}</div>
              <div className="mb-4 text-gray-700 dark:text-gray-300">{image.description || 'No description'}</div>
              <button
                onClick={e => { e.stopPropagation(); handleLike(); }}
                disabled={!userId || loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold shadow-lg focus:outline-none transition-all duration-200 backdrop-blur bg-white/80 dark:bg-slate-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-100 dark:border-indigo-900 ${isLiked ? 'text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}
              >
                {isLiked ? '❤️ Liked' : '🤍 Like'}
                <span className="ml-2">{likeCount}</span>
              </button>
              <div className="mt-6">
                <CommentSection imageId={image._id} />
              </div>
            </div>
          </div>
        </ImageModal>
      )}
    </div>
    </>
  );
};

export default ImageCard;
