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

  if (loading) {
    return (
      <p className="px-4 pt-10 text-gray-600">
        Loading maintenance records…
      </p>
    );
  }

  return (
    <div className="px-4 pt-10 space-y-6">
      {/* Top actions */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-600 hover:text-black hover:underline"
          >
            ← Back to Vehicle
          </button>

          <h2 className="text-2xl font-semibold text-gray-900 mt-2">
            Maintenance Records
          </h2>
          <p className="text-sm text-gray-600">
            View, update, and manage maintenance history.
          </p>
        </div>

        <button
          onClick={() => navigate(`/vehicles/${vehicleId}/maintenance/new`)}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900 transition"
        >
          Add Maintenance
        </button>
      </div>

      {/* Empty state */}
      {records.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">No maintenance records found.</p>
          <button
            onClick={() => navigate(`/vehicles/${vehicleId}/maintenance/new`)}
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-900 transition"
          >
            Create your first record
          </button>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left font-medium text-gray-700 px-4 py-3">
                      Type
                    </th>
                    <th className="text-left font-medium text-gray-700 px-4 py-3">
                      Status
                    </th>
                    <th className="text-left font-medium text-gray-700 px-4 py-3">
                      Service Date
                    </th>
                    <th className="text-left font-medium text-gray-700 px-4 py-3">
                      Cost
                    </th>
                    <th className="text-right font-medium text-gray-700 px-4 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {records.map((m) => (
                    <tr key={m.maintenance_id} className="hover:bg-gray-50">
                      {/* ✅ FIXED FIELD */}
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {m.type}
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded border px-2 py-1 text-xs text-gray-700">
                          {m.maintenance_status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-gray-700">
                        {m.service_date}
                      </td>

                      <td className="px-4 py-3 text-gray-700">
                        {m.cost}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingRecord(m)}
                            className="border px-3 py-1.5 rounded hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(m.maintenance_id)}
                            className="border border-red-300 text-red-600 px-3 py-1.5 rounded hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inline Edit Panel */}
          {editingRecord && (
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit Maintenance
                </h3>
                <button
                  onClick={() => setEditingRecord(null)}
                  className="text-sm text-gray-600 hover:text-black hover:underline"
                >
                  Close
                </button>
              </div>

              <MaintenanceForm
                initialData={editingRecord}
                onSubmit={handleUpdate}
                onCancel={() => setEditingRecord(null)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
