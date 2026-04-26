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
  const [showUsersTable, setShowUsersTable] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [admin, setAdmin] = useState(() => authAPI.getAdmin());
  const [showAdminProfile, setShowAdminProfile] = useState(false);
  const navigate = useNavigate();



  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('TOKEN:', authAPI.getToken());
      console.log('ADMIN:', authAPI.getAdmin());
    }

    // Fetch admin data from backend session
    const fetchAdmin = async () => {
      try {
        const session = await authAPI.checkSession();
        if (session && session.user && session.role === 'admin') {
          setAdmin({ ...session.user, role: session.role });
        }
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Admin session check failed:', err.response?.data || err.message);
        }
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
      const raw = response.data;
      const list = Array.isArray(raw) ? raw : Array.isArray(raw?.images) ? raw.images : [];
      setImages(list);
    } catch (error) {
      console.error('Error fetching images:', error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authAPI.logout();
    navigate('/login');
  };


    return (
      <div className="min-h-screen flex" style={{ background: '#f8fafc' }}>
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
                      {/* Admin Profile Modal */}
                      {showAdminProfile && admin && (
                        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 relative border-2 border-black">
                            <button
                              className="absolute top-2 right-2 text-black hover:text-gray-700 text-2xl font-bold"
                              onClick={() => setShowAdminProfile(false)}
                              title="Close"
                            >
                              &times;
                            </button>
                            <h2 className="text-xl font-bold mb-4 text-black">Admin Profile</h2>
                            <div className="mb-2 text-black"><span className="font-semibold">Name:</span> <span>{admin.name}</span></div>
                            <div className="mb-2 text-black"><span className="font-semibold">Email:</span> <span>{admin.email}</span></div>
                          </div>
                        </div>
                      )}
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
            <div
              className="p-6 flex flex-col items-center text-center bg-white border border-gray-200 rounded-2xl shadow min-h-[120px] cursor-pointer hover:bg-gray-100 transition"
              title="Click to view all users"
              onClick={() => setShowUsersTable(true)}
            >
              <span className="text-4xl mb-2">👤</span>
              <span className="text-2xl font-bold text-black">
                {usersLoading ? '...' : users.filter(u => u.email !== 'admin@hrtool.com').length}
              </span>
              <span className="text-black">Total Users</span>
              <span className="text-xs text-blue-500 mt-2">Click to view all users</span>
            </div>
                {/* Users Table Modal */}
                {showUsersTable && (
                  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6 relative">
                      <button
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                        onClick={() => setShowUsersTable(false)}
                        title="Close"
                      >
                        &times;
                      </button>
                      <h2 className="text-xl font-bold mb-4 text-gray-800">All Users</h2>
                      {usersLoading ? (
                        <div className="text-center py-8">Loading users...</div>
                      ) : users.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">No users found.</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full border border-black text-black">
                            <thead>
                              <tr className="bg-gray-100 text-black">
                                <th className="py-2 px-4 border border-black text-left">Name</th>
                                <th className="py-2 px-4 border border-black text-left">Email</th>
                              </tr>
                            </thead>
                            <tbody>
                              {users.filter(u => u.email !== 'admin@hrtool.com').map(u => (
                                <tr key={u._id} className="hover:bg-gray-50 text-black">
                                  <td className="py-2 px-4 border border-black">{u.name || '-'}</td>
                                  <td className="py-2 px-4 border border-black">{u.email}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
                user={admin}
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
          {selectedImage && (
            <ImageModal
              image={selectedImage}
              user={admin}
              onClose={() => setSelectedImage(null)}
              onUpdate={(updated) => {
                setImages((prev) =>
                  prev.map((img) => (img._id === updated._id ? { ...img, ...updated } : img))
                );
                setSelectedImage((prev) =>
                  prev && prev._id === updated._id ? { ...prev, ...updated } : prev
                );
              }}
              onDelete={(id) => {
                setImages((prev) => prev.filter((img) => img._id !== id));
                setSelectedImage(null);
              }}
            />
          )}
        </div> {/* End main content wrapper */}
      </div> {/* End flex-1 wrapper */}
    </div> /* End min-h-screen wrapper */
  );
};

// UploadForm component
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
      const data = err.response?.data;
      const msg = data?.message;
      const arr = data?.errors;
      if (Array.isArray(arr) && arr.length) {
        setError(arr.map((e) => e.msg || e.message || String(e)).join('. '));
      } else {
        setError(typeof msg === 'string' ? msg : msg != null ? String(msg) : err.message || 'Upload failed. Please try again.');
      }
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
            className="text-gray-400 hover:text-gray-700 text-2xl font-bold"
            onClick={onClose}
            title="Close"
          >
            &times;
          </button>
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Title</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-black"
              placeholder="Enter title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              style={{ color: 'black' }}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Description</label>
            <textarea
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-black"
              placeholder="Enter description"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              style={{ color: 'black' }}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Image File</label>
            <input
              type="file"
              accept="image/*"
              className="w-full text-black file:placeholder-black"
              onChange={handleImageChange}
              style={{ color: 'black' }}
            />
            {!formData.image && (
              <div className="mt-1 text-sm text-black">No file chosen</div>
            )}
            {preview && (
              <img src={preview} alt="Preview" className="mt-2 max-h-40 rounded border border-gray-200" />
            )}
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-200 text-black font-semibold hover:bg-gray-300"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gradient-btn px-6 py-2 font-semibold text-black shadow-lg"
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
