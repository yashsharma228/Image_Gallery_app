'use client';

import { useState, useEffect } from 'react';
import { imageAPI } from '@/lib/api';
import Image from 'next/image';
import CommentSection from './CommentSection';

const ImageCard = ({ image, userId, onLikeChange }) => {
  const [isLiked, setIsLiked] = useState(image.isLikedByUser || false);
  const [likeCount, setLikeCount] = useState(image.likeCount || 0);
  const [loading, setLoading] = useState(false);

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
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300">
      {/* Admin info */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <img
          src={image.adminAvatar || '/admin-avatar.png'}
          alt={image.adminName || 'Admin'}
          className="w-8 h-8 rounded-full border object-cover"
        />
        <span className="font-semibold text-gray-800">{image.adminName || 'Admin'}</span>
      </div>
      {/* Image */}
      <div className="relative w-full h-64 bg-gray-100">
        <img
          src={image.url}
          alt={image.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        {/* Like button and date */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={handleLike}
            disabled={!userId || loading}
            className={`group flex items-center gap-2 px-3 py-1 rounded-full font-semibold transition-all duration-200 focus:outline-none ${
              isLiked
                ? 'bg-pink-100 text-pink-600'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            } ${!userId ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ position: 'relative' }}
          >
            <span className={`transition-transform duration-200 ${isLiked ? 'scale-125 animate-bounce' : ''}`}>
              {isLiked ? '💖' : '🤍'}
            </span>
            <span className="ml-1 text-base">{likeCount}</span>
          </button>
          <span className="text-xs text-gray-400">
            {new Date(image.uploadedDate).toLocaleDateString()}
          </span>
        </div>
        {/* Title & Description */}
        <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">{image.title}</h3>
        <p className="text-sm text-gray-700 mb-2 line-clamp-2">{image.description}</p>
        {/* Comment Section */}
        <div className="mt-3">
          <CommentSection imageId={image._id} user={{ id: userId, name: image.uploaderName, avatar: image.uploaderAvatar }} />
        </div>
      </div>
    </div>
  );
};

export default ImageCard;
