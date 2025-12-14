export default function VehicleImageList({ images, onDelete }) {
  // Empty state
  if (!images.length) {
    return (
      <div className="mt-6 rounded-lg border border-dashed p-8 text-center text-gray-500">
        No vehicle images yet. Upload one to get started.
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {images.map((img) => (
        <div
          key={img.photo_id}
          className="group relative rounded-xl overflow-hidden border bg-white shadow-sm"
        >
          {/* Image */}
          <img
            src={img.image_path}
            alt="Vehicle"
            className="h-48 w-full object-cover bg-gray-100"
          />

          {/* Hover overlay */}
          <div
            className="absolute inset-0 bg-black/40 opacity-0
                       group-hover:opacity-100 transition
                       flex items-center justify-center"
          >
            <button
              onClick={() => {
                if (window.confirm("Delete this image?")) {
                  onDelete(img.photo_id);
                }
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-md
                         text-sm hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
