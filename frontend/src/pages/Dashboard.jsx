import { useEffect, useState } from "react";
import { getVehicles } from "../api/vehicleApi";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getVehicles()
      .then((res) => setVehicles(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="px-4 pt-10">
        <p className="text-gray-600">Loading vehicles…</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">
          Dashboard
        </h2>

        <button
          onClick={() => navigate("/vehicles/new")}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900 transition"
        >
          Add Vehicle
        </button>
      </div>

      {/* Empty state */}
      {vehicles.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">
            You have not added any vehicles yet.
          </p>

          <button
            onClick={() => navigate("/vehicles/new")}
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-900 transition"
          >
            Add your first vehicle
          </button>
        </div>
      ) : (
        /* Vehicle cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((v) => (
            <div
              key={v.vehicle_id}
              className="bg-white border rounded-lg p-6 shadow-sm hover:shadow transition"
            >
              <h3 className="text-lg font-medium text-gray-900">
                {v.make} {v.model}
              </h3>

              <p className="text-sm text-gray-600 mb-4">
                Year: {v.year}
              </p>

              <button
                onClick={() => navigate(`/vehicles/${v.vehicle_id}`)}
                className="text-sm font-medium text-black hover:underline"
              >
                View details →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
