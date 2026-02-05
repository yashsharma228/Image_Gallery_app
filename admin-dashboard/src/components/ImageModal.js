import React, { useState } from 'react';
import { imagesAPI } from '../api';
import CommentSection from './CommentSection';

const ImageModal = ({ image, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: image.title,
    description: image.description || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await imagesAPI.update(image._id, formData);
      onUpdate(response.data.image);
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
                <p className="text-xs text-gray-500">Upload Date</p>
                <p className="font-semibold">{new Date(image.uploadedDate).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Like Count</p>
                <p className="font-semibold">❤️ {image.likeCount || 0}</p>
              </div>
              {image.uploadedBy?.name && (
                <div>
                  <p className="text-xs text-gray-500">Uploaded By</p>
                  <p className="font-semibold">{image.uploadedBy.name}</p>
                </div>
              )}
              {image.uploadedBy?.email && (
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-semibold text-sm">{image.uploadedBy.email}</p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <CommentSection imageId={image._id} />

          {isEditing ? (
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{image.title}</h3>
              <p className="text-gray-600 mb-4">{image.description}</p>
              
              <div className="text-sm text-gray-500 space-y-1 mb-4">
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
