import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { imagesAPI, authAPI } from '../api';
import ImageGrid from '../components/ImageGrid';
import ImageModal from '../components/ImageModal';

const Dashboard = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    // Fetch admin data from backend session
    const fetchAdmin = async () => {
      try {
        const session = await authAPI.checkSession();
        if (session && session.user && session.role === 'admin') {
          setAdmin(session.user);
        }
      } catch (err) {
        setAdmin(null);
      }
    };
    fetchAdmin();
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await imagesAPI.getAll();
      setImages(response.data);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">🖼️ Image Gallery Admin</h1>
            <p className="text-sm text-blue-100">Manage your image collection</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Removed admin name and email from navbar */}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Images</p>
                <p className="text-3xl font-bold text-gray-800">{images.length}</p>
              </div>
              <div className="text-4xl">📸</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Likes</p>
                <p className="text-3xl font-bold text-gray-800">
                  {images.reduce((sum, img) => sum + (img.likeCount || 0), 0)}
                </p>
              </div>
              <div className="text-4xl">❤️</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <img
                src={admin?.profilePicture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(admin?.name || 'Admin')}
                alt="Admin profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-400"
              />
              <div>
                <p className="text-xl font-bold text-gray-800">{admin?.name || 'Admin'}</p>
                {admin?.email && (
                  <a href={`mailto:${admin.email}`} className="text-blue-600 underline text-sm">{admin.email}</a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setShowUploadForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition transform hover:scale-105"
          >
            ➕ Upload Image
          </button>
          <button
            onClick={fetchImages}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <UploadForm
            onSuccess={() => {
              setShowUploadForm(false);
              fetchImages();
            }}
            onClose={() => setShowUploadForm(false)}
          />
        )}

        {/* Images Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading images...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-xl text-gray-600 mb-2">No images uploaded yet</p>
            <p className="text-gray-500 mb-6">Click "Upload Image" to get started</p>
            <button
              onClick={() => setShowUploadForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Upload Your First Image
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              Showing {images.length} image{images.length !== 1 ? 's' : ''}
            </div>
            <ImageGrid
              images={images}
              onImageClick={setSelectedImage}
              onImageDelete={(id) => {
                setImages(images.filter(img => img._id !== id));
                fetchImages(); // Refresh to get updated data
              }}
              onImageUpdate={(id, updatedData) => {
                setImages(images.map(img => (img._id === id ? { ...img, ...updatedData } : img)));
                fetchImages(); // Refresh to get updated data
              }}
            />
          </>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <ImageModal
            image={selectedImage}
            onClose={() => setSelectedImage(null)}
            onUpdate={(updatedImage) => {
              setImages(images.map(img => (img._id === updatedImage._id ? updatedImage : img)));
              setSelectedImage(null);
            }}
            onDelete={(id) => {
              setImages(images.filter(img => img._id !== id));
              setSelectedImage(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

const UploadForm = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState({ title: '', description: '', image: null });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) {
      setError('Please select an image');
      return;
    }
    if (!formData.title.trim()) {
      setError('Please enter a title');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('image', formData.image);

      await imagesAPI.upload(data);
      setFormData({ title: '', description: '', image: null });
      setPreview(null);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Upload failed. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">📤 Upload New Image</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Image</label>
            {preview && (
              <div className="mb-3">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Supported formats: JPG, PNG, GIF, WebP</p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold"
            >
              {loading ? 'Uploading...' : 'Upload'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
