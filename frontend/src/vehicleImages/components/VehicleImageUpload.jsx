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

    try {
      setLoading(true);
      setError("");
      await onUpload(file);
      setFile(null);
      e.target.reset();
    } catch {
      setError("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Upload Vehicle Image
      </h3>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-end"
      >
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              setError("");
              setFile(e.target.files[0]);
            }}
            className="block w-full text-sm text-gray-700
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-md file:border-0
                       file:bg-gray-100 file:text-gray-700
                       hover:file:bg-gray-200"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-6 py-2 rounded-md
                     hover:bg-gray-900 transition disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
