import { useNavigate, useParams } from "react-router-dom";
import MaintenanceForm from "../components/MaintenanceForm";
import { createMaintenance } from "../../api/maintenanceApi";

export default function MaintenanceFormPage() {
  const { id: vehicleId } = useParams();
  const navigate = useNavigate();

  const handleCreate = async (payload) => {
    await createMaintenance(vehicleId, payload);
    navigate(`/vehicles/${vehicleId}/maintenance`);
  };

  return (
    <div className="px-4 pt-10 space-y-6">
      {/* Header */}
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-600 hover:text-black hover:underline"
        >
          ← Back to Maintenance
        </button>

        <h2 className="text-2xl font-semibold text-gray-900 mt-2">
          Create Maintenance Record
        </h2>
        <p className="text-sm text-gray-600">
          Add a new maintenance entry for this vehicle.
        </p>
      </div>

      {/* Form */}
      <MaintenanceForm
        onSubmit={handleCreate}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
}
