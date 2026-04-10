import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { imagesAPI, authAPI, usersAPI } from '../api';
import ImageGrid from '../components/ImageGrid';
import ImageModal from '../components/ImageModal';

const Dashboard = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [showAdminProfile, setShowAdminProfile] = useState(false);
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
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data.users || []);
    } catch (error) {
      setUsers([]);
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

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
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar removed as per request */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="w-full shadow-lg bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">Framely Admin</h1>
                <p className="text-sm text-gray-500">Manage your image collection</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  className="rounded-full border border-gray-300 bg-gray-100 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-200 transition"
                  title="Admin Profile"
                  onClick={() => setShowAdminProfile(true)}
                >
                  Admin Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="gradient-btn px-4 py-2 font-semibold"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

        <div className="max-w-7xl mx-auto px-4 py-8 w-full">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="p-6 flex flex-col items-center text-center bg-white border border-gray-200 rounded-2xl shadow">
              <span className="text-3xl font-bold text-black">{images.length}</span>
              <span className="text-black">Total Images</span>
            </div>
            <div className="p-6 flex flex-col items-center text-center bg-white border border-gray-200 rounded-2xl shadow">
              <span className="text-4xl mb-2">❤️</span>
              <span className="text-2xl font-bold text-black">{images.reduce((sum, img) => sum + (img.likeCount || 0), 0)}</span>
              <span className="text-black">Total Likes</span>
            </div>
            <div className="p-6 flex flex-col items-center text-center bg-white border border-gray-200 rounded-2xl shadow min-h-[120px]">
              <span className="text-4xl mb-2">👤</span>
              <span className="text-2xl font-bold text-black">
                {usersLoading ? '...' : users.length}
              </span>
              <span className="text-black">Total Users</span>
              {/* Show user details in a scrollable area if users exist */}
              {users.length > 0 && (
                <div className="mt-2 max-h-32 overflow-y-auto w-full text-xs text-left">
                  {users.map(u => (
                    <div key={u._id} className="border-b border-gray-100 py-1">
                      <span className="font-semibold">{u.name || u.email}</span>
                      <span className="ml-2 text-gray-400">{u.email}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setShowUploadForm(true)}
              className="gradient-btn px-6 py-3 font-semibold shadow-lg transition transform hover:scale-105"
            >
              ➕ Upload Image
            </button>
            <button
              onClick={fetchImages}
              className="card px-6 py-3 font-semibold shadow-lg transition"
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
            <div className="flex flex-wrap gap-6 justify-center items-start py-12">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton w-72 h-96 mb-4" />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 card">
              <div className="text-6xl mb-4">📷</div>
              <p className="text-xl text-gray-300 mb-2">No images uploaded yet</p>
              <p className="text-gray-400 mb-6">Click "Upload Image" to get started</p>
              <button
                onClick={() => setShowUploadForm(true)}
                className="gradient-btn px-6 py-3 font-semibold"
              >
                Upload Your First Image
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4 text-gray-400">
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
