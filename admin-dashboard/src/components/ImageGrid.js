import React from 'react';
import CommentSection from './CommentSection';
import { imagesAPI } from '../api';

const ImageGrid = ({ images, onImageClick, onImageDelete, onImageUpdate }) => {
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await imagesAPI.delete(id);
        onImageDelete(id);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
  };

  const [openCommentId, setOpenCommentId] = React.useState(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image) => (
        <div
          key={image._id}
          className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer transform hover:scale-105"
          onClick={() => onImageClick(image)}
        >
          <div className="relative">
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              ❤️ {image.likeCount || 0}
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-lg text-gray-800 truncate mb-1">{image.title}</h3>
            <p className="text-sm text-gray-600 truncate mb-2">{image.description || 'No description'}</p>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span>📅 {new Date(image.uploadedDate).toLocaleDateString()}</span>
              {image.uploadedBy && (
                <span>
                  👤 Uploaded by: {image.uploadedBy.name} ({image.uploadedBy.email})
                </span>
              )}
            </div>
            {image.likedByUsers && image.likedByUsers.length > 0 && (
              <div className="mb-2 text-xs text-gray-700">
                <span className="font-semibold">Liked by:</span>
                <ul className="list-disc list-inside">
                  {image.likedByUsers.map((user) => (
                    <li key={user._id}>{user.name} ({user.email})</li>
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
                💬 Comments
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
