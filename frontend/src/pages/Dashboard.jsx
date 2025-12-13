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

  if (loading) return <p>Loading vehicles...</p>;

  return (
    <div>
      <h2>Dashboard</h2>

      {vehicles.length === 0 ? (
        <>
          <p>You have not added any vehicles yet.</p>
          <button onClick={() => navigate("/vehicles/new")}>
            Add Vehicle
          </button>
        </>
      ) : (
        <>
          <button onClick={() => navigate("/vehicles/new")}>
            Add Vehicle
          </button>

          <ul>
            {vehicles.map((v) => (
              <li key={v.vehicle_id}>
                {v.make} {v.model} ({v.year})
                <button onClick={() => navigate(`/vehicles/${v.vehicle_id}`)}>
                  View
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
