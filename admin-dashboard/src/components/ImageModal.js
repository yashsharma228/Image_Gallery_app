import React, { useState, useEffect } from 'react';
import { imagesAPI } from '../api';
import CommentSection from './CommentSection';

const ImageModal = ({ image, onClose, onUpdate, onDelete, user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (image) {
      setFormData({
        title: typeof image.title === 'string' ? image.title : '',
        description: typeof image.description === 'string' ? image.description : '',
      });
      setIsEditing(false);
      setError('');
    }
  }, [image]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await imagesAPI.update(image._id, formData);
      const next = response.data?.image || response.data;
      onUpdate(next);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await imagesAPI.delete(image._id);
        onDelete(image._id);
        onClose();
      } catch (error) {
        setError('Error deleting image');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">📷 Image Details & Management</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-3xl font-bold transition"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-80 object-cover rounded-lg shadow-lg"
            />
          </div>
          
          {/* Image Metadata Display */}
          {!isEditing && (
            <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-black">Upload Date</p>
                <p className="font-semibold text-black">{new Date(image.uploadedDate).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-black">Like Count</p>
                <p className="font-semibold  text-black">❤️ {image.likeCount || 0}</p>
              </div>
              {image.uploadedBy?.name && (
                <div>
                  <p className="text-xs text-black">Uploaded By</p>
                  <p className="font-semibold  text-black">{image.uploadedBy.name}</p>
                </div>
              )}
              {image.uploadedBy?.email && (
                <div>
                  <p className="text-xs text-black">Email</p>
                  <p className="font-semibold text-sm  text-black">{image.uploadedBy.email}</p>
                </div>
              )}
            </div>
          )}

          {error != null && error !== '' && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {typeof error === 'string' ? error : String(error)}
            </div>
          )}

          <CommentSection
            imageId={image._id}
            user={user}
            isAdmin={!!user && (user.role === 'admin' || user.role === 'superadmin')}
          />

          {isEditing ? (
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-black font-semibold mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-black rounded-lg placeholder-black text-black"
                  placeholder="Title"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-black font-semibold mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-black rounded-lg placeholder-black text-black"
                  placeholder="Description"
                  rows="3"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-black mb-2">
                {typeof image.title === 'string' ? image.title : String(image.title ?? '')}
              </h3>
              <p className="text-black mb-4">
                {typeof image.description === 'string' ? image.description : String(image.description ?? '')}
              </p>
              
              <div className="text-sm text-black space-y-1 mb-4">
                <p>Uploaded: {new Date(image.uploadedDate).toLocaleDateString()}</p>
                <p>By: {image.uploadedBy?.name || 'Unknown'}</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Delete
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
