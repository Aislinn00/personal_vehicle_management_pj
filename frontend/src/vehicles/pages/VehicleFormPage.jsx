import { useNavigate, useParams } from "react-router-dom";
import { createVehicle, updateVehicle, getVehicleById } from "../../api/vehicleApi";
import VehicleForm from "../components/VehicleForm";
import { useEffect, useState } from "react";

export default function VehicleFormPage({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    if (mode === "edit") {
      getVehicleById(id).then((res) => setInitialData(res.data));
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
    <VehicleForm
      mode={mode}
      initialData={initialData}
      onSubmit={handleSubmit}
    />
  );
}
