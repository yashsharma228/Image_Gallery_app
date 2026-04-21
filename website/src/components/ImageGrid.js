import ImageCard from './ImageCard';
import { motion } from 'framer-motion';

export default function ImageGrid({ images, user, onLikeChange }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 font-medium">No images found matching your search.</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6"
      style={{ breakInside: 'avoid' }}
    >
      {images.map((img) => (
        <div key={img._id} className="mb-6 break-inside-avoid">
          <ImageCard image={img} user={user} onLikeChange={onLikeChange} />
        </div>
      ))}
    </motion.div>
  );
}
