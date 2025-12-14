import { useNavigate, useParams } from "react-router-dom";
import ReminderForm from "../components/ReminderForm";
import { createReminder } from "../../api/reminderApi";

export default function ReminderFormPage() {
  const { id: vehicleId } = useParams();
  const navigate = useNavigate();

  const handleCreate = async (data) => {
    await createReminder(vehicleId, data);
    navigate(`/vehicles/${vehicleId}/reminders`);
  };

  return (
    <div>
      <h2>Create Reminder</h2>
      <ReminderForm
        onSubmit={handleCreate}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
}
