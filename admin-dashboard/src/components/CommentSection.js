import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export default function CommentSection({ imageId, showModal, setShowModal, user }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Define FIRST, use useCallback
  const fetchComments = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/comments/${imageId}`);
      setComments(res.data);
    } catch (err) {
      setComments([]);
    }
  }, [imageId]);

  // ✅ Use AFTER definition
  useEffect(() => {
    if (showModal) fetchComments();
  }, [showModal, fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !text.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/comments/${imageId}`,
        { text },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      setText('');
      fetchComments();
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-4 relative flex flex-col" style={{ maxHeight: '80vh' }}>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            <h4 className="font-semibold mb-2 text-center">Comments</h4>
            <div className="flex-1 overflow-y-auto space-y-3 mb-3" style={{ minHeight: '120px' }}>
              {comments.length === 0 ? (
                <p className="text-gray-400 text-center">No comments yet.</p>
              ) : (
                comments.map(comment => (
                  <div key={comment._id} className={`flex items-start gap-2 ${comment.user?.id === user?.id ? 'justify-end' : ''}`}> 
                    <img
                      src={comment.user?.avatar || '/default-avatar.png'}
                      alt={comment.user?.name || 'User'}
                      className="w-7 h-7 rounded-full border object-cover"
                    />
                    <div className={`rounded-2xl px-3 py-2 shadow-sm ${comment.user?.id === user?.id ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-800'}`}
                      style={{ maxWidth: '70%' }}>
                      <div className="text-xs font-semibold mb-1">{comment.user?.name || 'User'}</div>
                      <div className="text-sm">{comment.text}</div>
                      <div className="text-[10px] text-gray-400 mt-1">{new Date(comment.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2 mt-auto">
              <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                className="flex-1 border rounded-full px-3 py-2"
                placeholder="Type a comment..."
                disabled={!user || loading}
              />
              <button type="submit" disabled={!user || loading || !text.trim()} className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold">
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
