import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getVehicleById, deleteVehicle } from "../../api/vehicleApi";
import { getVehicleImages, uploadVehicleImage, deleteVehicleImage} from "../../api/vehicleImage";
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
      } catch (err) {
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

  if (loading) return <p>Loading vehicle...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!vehicle) return <p>Vehicle not found.</p>;

  return (
    <div>
      <h2>Vehicle Detail</h2>

      <p>
        <strong>
          {vehicle.make} {vehicle.model}
        </strong>
      </p>
      <p>Year: {vehicle.year}</p>
      <p>Fuel: {vehicle.fuel_type}</p>
      <p>Mileage: {vehicle.mileage}</p>

      {/* VEHICLE ACTIONS */}
      <div style={{ marginTop: "1rem" }}>
        <button onClick={() => navigate(`/vehicles/${id}/edit`)}>
          Edit Vehicle
        </button>

        <button
          onClick={async () => {
            if (!window.confirm("Delete this vehicle?")) return;
            await deleteVehicle(id);
            navigate("/dashboard");
          }}
          style={{ marginLeft: "0.5rem" }}
        >
          Delete Vehicle
        </button>
      </div>

      {/* MAINTENANCE SECTION */}
      <div style={{ marginTop: "1.5rem" }}>
        <h3>Maintenance</h3>

        <button onClick={() => navigate(`/vehicles/${id}/maintenance/new`)}>
          Create Maintenance
        </button>

        <button
          onClick={() => navigate(`/vehicles/${id}/maintenance`)}
          style={{ marginLeft: "0.5rem" }}
        >
          View Maintenance Records
        </button>
      </div>

      {/* REMINDERS SECTION */}
      <div style={{ marginTop: "1.5rem" }}>
        <h3>Reminders</h3>

        <button onClick={() => navigate(`/vehicles/${id}/reminders/new`)}>
          Create Reminder
        </button>

        <button
          onClick={() => navigate(`/vehicles/${id}/reminders`)}
          style={{ marginLeft: "0.5rem" }}
        >
          View Reminders
        </button>
      </div>

      {/* VEHICLE IMAGES SECTION */}
      <div style={{ marginTop: "1.5rem" }}>
        <h3>Vehicle Images</h3>

        <VehicleImageUpload onUpload={handleUploadImage} />

        {imageLoading ? (
          <p>Loading images...</p>
        ) : (
          <VehicleImageList images={images} onDelete={handleDeleteImage} />
        )}
      </div>

      {/* NAVIGATION */}
      <div style={{ marginTop: "2rem" }}>
        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
