import ImageCard from './ImageCard';

export default function ImageGrid({ images, userId, onLikeChange }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
      style={{
        gridAutoRows: '1fr',
      }}
    >
      {images.map((img) => (
        <ImageCard key={img._id} image={img} userId={userId} onLikeChange={onLikeChange} />
      ))}
    </div>
  );
}
