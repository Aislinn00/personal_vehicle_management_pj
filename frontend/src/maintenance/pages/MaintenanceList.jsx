import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getMaintenanceByVehicle,
  deleteMaintenance,
  updateMaintenance,
} from "../../api/maintenanceApi";
import MaintenanceForm from "../components/MaintenanceForm";

export default function MaintenanceList() {
  const { id: vehicleId } = useParams();
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMaintenance = async () => {
    setLoading(true);
    const res = await getMaintenanceByVehicle(vehicleId);
    setRecords(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadMaintenance();
  }, [vehicleId]);

  const handleDelete = async (maintenanceId) => {
    await deleteMaintenance(maintenanceId);
    loadMaintenance();
  };

  const handleUpdate = async (payload) => {
    await updateMaintenance(editingRecord.maintenance_id, payload);
    setEditingRecord(null);
    loadMaintenance();
  };

  if (loading) return <p>Loading maintenance records...</p>;

  return (
    <div>
      <h2>Maintenance Records</h2>

      <button onClick={() => navigate(-1)}>Back to Vehicle</button>
      <button
        onClick={() =>
          navigate(`/vehicles/${vehicleId}/maintenance/new`)
        }
      >
        Add Maintenance
      </button>

      {records.length === 0 && <p>No maintenance records found.</p>}

      <ul>
        {records.map((m) => (
          <li key={m.maintenance_id}>
            <b>{m.maintenance_type}</b> — {m.maintenance_status}
            <br />
            Date: {m.service_date} | Cost: {m.cost}

            <div>
              <button onClick={() => setEditingRecord(m)}>Edit</button>
              <button onClick={() => handleDelete(m.maintenance_id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {editingRecord && (
        <MaintenanceForm
          initialData={editingRecord}
          onSubmit={handleUpdate}
          onCancel={() => setEditingRecord(null)}
        />
      )}
    </div>
  );
}
