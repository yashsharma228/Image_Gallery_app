import React, { useState } from 'react';
import CommentSection from './CommentSection';
import { imagesAPI } from '../api';

const safeText = (v, fallback = '') => {
  if (v == null) return fallback;
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  return fallback;
};

const ImageGrid = ({ images, onImageClick, onImageDelete, onImageUpdate, user }) => {
  const [openCommentId, setOpenCommentId] = useState(null);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await imagesAPI.delete(id);
        onImageDelete(id);
      } catch (err) {
        alert('Failed to delete image.');
      }
    }
  };



  // Defensive: skip any image with a field that is a React element (object with $$typeof)
  const isReactElement = val => val && typeof val === 'object' && val.$$typeof;
  const validImages = images.filter(image => {
    if (isReactElement(image.title) || isReactElement(image.description) || isReactElement(image.url)) {
      console.warn('Filtered out image with React element field:', image);
      return false;
    }
    if (
      typeof image.title !== 'string' ||
      typeof image.description !== 'string' ||
      typeof image.url !== 'string'
    ) {
      console.warn('Filtered out image with non-string field:', image);
      return false;
    }
    return true;
  });

  if (images.length > 0 && validImages.length === 0) {
    // All images were filtered out due to invalid data
    return (
      <div className="text-center py-12 card">
        <div className="text-6xl mb-4">⚠️</div>
        <p className="text-xl text-red-500 mb-2">All images were filtered out due to invalid data.</p>
        <p className="text-gray-400 mb-6">Check the browser console for details and fix your backend to return only strings for title, description, and url.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {validImages.map((image) => (
        <div
          key={image._id}
          className="overflow-hidden hover:shadow-glass transition cursor-pointer transform hover:scale-105 group bg-white border border-gray-200 rounded-2xl shadow"
          onClick={() => onImageClick(image)}
        >
          <div className="relative">
            <img
              src={typeof image.url === 'string' ? image.url : ''}
              alt={typeof image.title === 'string' ? image.title : ''}
              className="w-full h-48 object-cover group-hover:scale-105 group-hover:shadow-2xl transition-transform duration-300"
            />
            <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
              ❤️ {image.likeCount || 0} • 💬 {image.commentCount || 0}
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-lg text-black truncate mb-1">{typeof image.title === 'string' ? image.title : '[Invalid title]'}</h3>
            <p className="text-sm text-black truncate mb-2">{typeof image.description === 'string' ? image.description : '[Invalid description]'}</p>
            <div className="flex items-center justify-between text-xs text-black mb-3">
              <span>📅 {new Date(image.uploadedDate).toLocaleDateString()}</span>
              {image.uploadedBy && (
                <span>
                  👤 Uploaded by: {safeText(image.uploadedBy.name, '—')} ({safeText(image.uploadedBy.email, '—')})
                </span>
              )}
            </div>
            {image.likedByUsers && image.likedByUsers.filter(Boolean).length > 0 && (
              <div className="mb-2 text-xs text-black">
                <span className="font-semibold">Liked by:</span>
                <ul className="list-disc list-inside">
                  {image.likedByUsers.filter(Boolean).map((likedUser) => (
                    <li key={likedUser._id || likedUser.id || String(likedUser.email)}>
                      {safeText(likedUser.name, '—')} ({safeText(likedUser.email, '—')})
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={e => {
                  e.stopPropagation();
                  setOpenCommentId(image._id);
                }}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold"
              >
                💬 Comments ({image.commentCount || 0})
              </button>
              <CommentSection
                imageId={image._id}
                showModal={openCommentId === image._id}
                setShowModal={val => {
                  if (val) {
                    setOpenCommentId(image._id);
                  } else {
                    setOpenCommentId(null);
                  }
                }}
                user={user}
                isAdmin={!!user && (user.role === 'admin' || user.role === 'superadmin')}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onImageClick(image);
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold"
              >
                View/Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(image._id);
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
export default ImageGrid;
