
import { useState, useEffect } from 'react';
import { Send, User as UserIcon } from 'lucide-react';
import api from '@/lib/api';

export default function CommentSection({ imageId, user, admin, open = true, onCommentChange }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    fetchComments();
  }, [imageId]);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/${imageId}`);
      setComments(Array.isArray(res.data) ? res.data.reverse() : []); // Most recent last (chat style)
      onCommentChange?.(Array.isArray(res.data) ? res.data.length : 0);
    } catch (err) {
      setComments([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !text.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await api.post(
        `/comments/${imageId}`,
        { text },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      setText('');
      fetchComments();
    } catch (err) {
      // Optionally show error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col h-96">
      {/* Comments List - WhatsApp group chat style */}
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mb-3">
        {comments.length === 0 && (
          <div className="text-center text-slate-400 my-auto">No comments yet.</div>
        )}
        {comments.map((c) => (
          <div key={c._id} className="flex items-end gap-2 w-full">
            <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-base">
              {c.user?.name?.charAt(0)?.toUpperCase() || c.admin?.name?.charAt(0)?.toUpperCase() || <UserIcon size={16} />}
            </div>
            <div className="flex flex-col items-start max-w-[80%]">
              <span className="font-bold text-xs text-indigo-700 dark:text-indigo-300 mb-1">
                {c.user?.name || c.admin?.name || 'User'}
              </span>
              <span className="rounded-2xl px-4 py-2 bg-white dark:bg-slate-900 shadow text-slate-800 dark:text-slate-100 text-base">
                {c.text}
              </span>
            </div>
          </div>
        ))}
      </div>
      {/* Add Comment */}
      {(user || admin) && (
        <form className="flex items-center gap-2 mt-2" onSubmit={handleSubmit}>
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Type a message..."
            disabled={loading}
          />
          <button
            type="submit"
            className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
            disabled={loading || !text.trim()}
          >
            <Send size={18} />
          </button>
        </form>
      )}
    </div>
  );
}
