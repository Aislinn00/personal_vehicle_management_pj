import { useNavigate, useParams } from "react-router-dom";
import {
  createVehicle,
  updateVehicle,
  getVehicleById,
} from "../../api/vehicleApi";
import VehicleForm from "../components/VehicleForm";
import { useEffect, useState } from "react";

export default function VehicleFormPage({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(mode === "edit");

  useEffect(() => {
    if (mode === "edit") {
      getVehicleById(id)
        .then((res) => setInitialData(res.data))
        .finally(() => setLoading(false));
    }
  }, [mode, id]);

  const handleSubmit = async (payload) => {
    if (mode === "edit") {
      await updateVehicle(id, payload);
      navigate(`/vehicles/${id}`);
    } else {
      await createVehicle(payload);
      navigate("/dashboard");
    }
  };

  return (
    <div className="px-4 pt-10 space-y-6">
      {/* Page header */}
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          {mode === "edit" ? "Edit Vehicle" : "Add Vehicle"}
        </h1>

        <button
          onClick={() =>
            navigate(mode === "edit" ? `/vehicles/${id}` : "/dashboard")
          }
          className="text-sm text-black hover:underline"
        >
          Cancel
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="max-w-2xl mx-auto bg-white border rounded-lg p-8">
          <p className="text-gray-600">Loading vehicle data…</p>
        </div>
      ) : (
        <VehicleForm
          mode={mode}
          initialData={initialData}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
