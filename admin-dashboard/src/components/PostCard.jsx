import React, { useState } from "react";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// import LikeButton from "./LikeButton";
import CommentSection from "./CommentSection";

export default function PostCard({
  post,
  user,
  onLike,
  onComment,
  onDelete,
  onViewAllComments
}) {
  const [showHeart, setShowHeart] = useState(false);

  // Double click handler for heart animation
  const handleDoubleClick = () => {
    if (!post.likedByCurrentUser) onLike(post._id);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 900);
  };

  return (
    <div className="bg-[#121212] border border-[#262626] rounded-xl shadow p-0 mb-6 w-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <img
          src={post.uploadedBy?.avatar || "/avatar.png"}
          alt={post.uploadedBy?.name}
          className="w-9 h-9 rounded-full object-cover border border-[#262626]"
        />
        <span className="font-semibold text-white text-sm">
          {post.uploadedBy?.name || "User"}
        </span>
      </div>
      {/* Image */}
      <div className="relative w-full bg-black">
        <img
          src={post.url}
          alt={post.title}
          className="w-full max-h-[500px] object-cover select-none"
          loading="lazy"
          onDoubleClick={handleDoubleClick}
        />
        <AnimatePresence>
          {showHeart && (
            <motion.span
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none select-none"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.3, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.6, type: "spring" }}
              style={{ color: "#ff3366", textShadow: "0 2px 8px #fff", fontSize: 90 }}
            >
              ❤️
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      {/* Actions */}
      <div className="flex items-center gap-4 px-4 pt-3 pb-1">
        {/* LikeButton removed: file missing. Replace with icon/button if needed. */}
        <button
          className={`group p-1 rounded-full hover:bg-[#262626] transition duration-200 ${post.likedByCurrentUser ? 'text-pink-500' : 'text-white'}`}
          onClick={() => onLike(post._id)}
        >
          <Heart className="w-6 h-6 inline" />
          <span className="ml-1 text-sm align-middle">{post.likeCount}</span>
        </button>
        <button className="group p-1 rounded-full hover:bg-[#262626] transition duration-200">
          <MessageCircle className="w-6 h-6 text-white group-hover:text-blue-400" />
        </button>
        {((user && user.role === "admin") || user?._id === post.uploadedBy?._id) && (
          <button
            className="ml-auto group p-1 rounded-full hover:bg-[#262626] transition duration-200"
            onClick={() => onDelete(post._id)}
          >
            <Trash2 className="w-5 h-5 text-red-400 group-hover:text-red-600" />
          </button>
        )}
      </div>
      {/* Like count */}
      <div className="px-4 text-sm font-semibold text-white mb-1">
        {post.likeCount > 0 ? `${post.likeCount} like${post.likeCount > 1 ? "s" : ""}` : ""}
      </div>
      {/* Caption */}
      <div className="px-4 text-sm mb-1">
        <span className="font-semibold mr-2 text-white">{post.uploadedBy?.name || "User"}</span>
        <span className="text-gray-300">{post.description}</span>
      </div>
      {/* Comments preview */}
      {post.comments && post.comments.length > 0 && (
        <div className="px-4 text-gray-400 text-sm mb-1 cursor-pointer hover:underline" onClick={() => onViewAllComments(post._id)}>
          View all {post.comments.length} comments
        </div>
      )}
      {/* Latest 2-3 comments */}
      <div className="px-4 mb-2">
        {post.comments?.slice(-3).map((c) => (
          <div key={c._id} className="flex items-center gap-2 text-sm mb-1">
            <span className="font-semibold text-white">{c.user?.name || "User"}</span>
            <span className="text-gray-300">{c.text}</span>
            {((user && user.role === "admin") || user?._id === c.user?._id) && (
              <button className="ml-2 text-xs text-red-400 hover:text-red-600" onClick={() => onDelete(post._id, c._id)}>
                <Trash2 className="w-4 h-4 inline" />
              </button>
            )}
          </div>
        ))}
      </div>
      {/* Add comment */}
      <CommentSection postId={post._id} onComment={onComment} />
    </div>
  );
}
