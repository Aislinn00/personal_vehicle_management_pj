export default function VehicleImageList({ images, onDelete }) {
  if (!images.length) {
    return <p>No images uploaded.</p>;
  }

  return (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      {images.map((img) => (
        <div key={img.photo_id}>
          <img
            src={img.image_path}
            alt="Vehicle"
            style={{ width: "200px", borderRadius: "6px" }}
          />
          <br />
          <button onClick={() => onDelete(img.photo_id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
