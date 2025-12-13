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
    <div>
      <h2>Create Maintenance Record</h2>

      <MaintenanceForm
        onSubmit={handleCreate}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
}
