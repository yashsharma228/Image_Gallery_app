export default function AdminGalleryGrid({ images }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {images.map(img => (
        <div key={img._id} className="overflow-hidden rounded-lg bg-white shadow group">
          <img
            src={img.url}
            alt={img.title}
            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ))}
    </div>
  );
}
