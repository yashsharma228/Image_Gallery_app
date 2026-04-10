import React from 'react';

export default function ImageModal({ image, onClose, children }) {
  if (!image) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl font-bold text-gray-400 hover:text-gray-700 dark:hover:text-white"
          aria-label="Close"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
