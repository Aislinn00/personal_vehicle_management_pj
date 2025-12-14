import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getVehicleById, deleteVehicle } from "../../api/vehicleApi";
import {
  getVehicleImages,
  uploadVehicleImage,
  deleteVehicleImage,
} from "../../api/vehicleImageApi";
import VehicleImageUpload from "../../vehicleImages/components/VehicleImageUpload";
import VehicleImageList from "../../vehicleImages/components/VehicleImageList";

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [images, setImages] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const vehicleRes = await getVehicleById(id);
        setVehicle(vehicleRes.data);

        const imageRes = await getVehicleImages(id);
        setImages(imageRes.data);
      } catch {
        setError("Failed to load vehicle data.");
      } finally {
        setLoading(false);
        setImageLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleUploadImage = async (file) => {
    await uploadVehicleImage(id, file);
    const res = await getVehicleImages(id);
    setImages(res.data);
  };

  const handleDeleteImage = async (photoId) => {
    if (!window.confirm("Delete this image?")) return;
    await deleteVehicleImage(photoId);
    setImages(images.filter((img) => img.photo_id !== photoId));
  };

  if (loading) return <p className="px-4 pt-10">Loading vehicle…</p>;
  if (error) return <p className="px-4 pt-10 text-red-600">{error}</p>;
  if (!vehicle) return <p className="px-4 pt-10">Vehicle not found.</p>;

  return (
    <div className="px-4 pt-15 space-y-8">
      {/* Back */}
      <button
        onClick={() => navigate("/dashboard")}
        className="text-sm text-gray-600 hover:text-black hover:underline"
      >
        ← Back to Dashboard
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            {vehicle.make} {vehicle.model}
          </h2>
          <p className="text-sm text-gray-600">Year: {vehicle.year}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/vehicles/${id}/edit`)}
            className="border px-4 py-2 rounded hover:bg-gray-50"
          >
            Edit
          </button>

          <button
            onClick={async () => {
              if (!window.confirm("Delete this vehicle?")) return;
              await deleteVehicle(id);
              navigate("/dashboard");
            }}
            className="border border-red-300 text-red-600 px-4 py-2 rounded hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="bg-white border rounded-lg p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-500">Fuel Type</p>
          <p className="font-medium">{vehicle.fuel_type || "—"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Mileage</p>
          <p className="font-medium">{vehicle.mileage ?? "—"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Registration</p>
          <p className="font-medium">{vehicle.registration_number || "—"}</p>
        </div>
      </div>

      {/* Maintenance */}
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold">Maintenance</h3>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/vehicles/${id}/maintenance/new`)}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900"
          >
            Create Maintenance
          </button>

          <button
            onClick={() => navigate(`/vehicles/${id}/maintenance`)}
            className="border px-4 py-2 rounded hover:bg-gray-50"
          >
            View Records
          </button>
        </div>
      </div>

      {/* Reminders */}
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold">Reminders</h3>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/vehicles/${id}/reminders/new`)}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900"
          >
            Create Reminder
          </button>

          <button
            onClick={() => navigate(`/vehicles/${id}/reminders`)}
            className="border px-4 py-2 rounded hover:bg-gray-50"
          >
            View Reminders
          </button>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold">Vehicle Images</h3>

        <VehicleImageUpload onUpload={handleUploadImage} />

        {imageLoading ? (
          <p className="text-sm text-gray-500">Loading images…</p>
        ) : (
          <VehicleImageList images={images} onDelete={handleDeleteImage} />
        )}
      </div>
    </div>
  );
}
