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
    <div className="px-4 pt-10 space-y-6">
      {/* Header */}
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-600 hover:text-black hover:underline"
        >
          ← Back to Reminders
        </button>

        <h2 className="text-2xl font-semibold text-gray-900 mt-2">
          Create Reminder
        </h2>
        <p className="text-sm text-gray-600">
          Set up a reminder for important vehicle events.
        </p>
      </div>

      {/* Form */}
      <div className="max-w-xl mx-auto">
        <ReminderForm
          onSubmit={handleCreate}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
}
