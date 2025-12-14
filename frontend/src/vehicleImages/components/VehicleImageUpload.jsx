import { useState } from "react";

export default function VehicleImageUpload({ onUpload }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an image.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onUpload(file);
      setFile(null);
    } catch {
      setError("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Uploading..." : "Upload Image"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
