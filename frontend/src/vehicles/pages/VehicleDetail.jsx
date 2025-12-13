import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getVehicleById, deleteVehicle } from "../../api/vehicleApi";

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    getVehicleById(id).then((res) => setVehicle(res.data));
  }, [id]);

  if (!vehicle) return <p>Loading vehicle...</p>;

  return (
    <div>
      <h2>Vehicle Detail</h2>

      <p>
        {vehicle.make} {vehicle.model}
      </p>
      <p>Year: {vehicle.year}</p>
      <p>Fuel: {vehicle.fuel_type}</p>
      <p>Mileage: {vehicle.mileage}</p>

      <button onClick={() => navigate(`/vehicles/${id}/edit`)}>Edit</button>

      <button
        onClick={async () => {
          await deleteVehicle(id);
          navigate("/dashboard");
        }}
      >
        Delete
      </button>

      <button onClick={() => navigate(`/vehicles/${id}/maintenance/new`)}>
        Create Maintenance
      </button>

      <button onClick={() => navigate(`/vehicles/${id}/maintenance`)}>
        View Maintenance Records
      </button>

      <button onClick={() => navigate("/dashboard")}>Back</button>
    </div>
  );
}
