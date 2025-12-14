import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getRemindersByVehicle,
  completeReminder,
  deleteReminder,
} from "../../api/reminderApi";

export default function ReminderList() {
  const { id: vehicleId } = useParams();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState("upcoming");
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const loadReminders = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await getRemindersByVehicle(vehicleId, statusFilter);
      setReminders(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to load reminders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, [vehicleId, statusFilter]);

  const handleComplete = async (id) => {
    setBusyId(id);
    await completeReminder(id);
    await loadReminders();
    setBusyId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this reminder?")) return;
    setBusyId(id);
    await deleteReminder(id);
    await loadReminders();
    setBusyId(null);
  };

  return (
    <div className="px-4 pt-10 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-600 hover:text-black hover:underline"
          >
            ← Back to Vehicle
          </button>

          <h2 className="text-2xl font-semibold text-gray-900 mt-2">
            Reminders
          </h2>
          <p className="text-sm text-gray-600">
            Manage upcoming and completed reminders.
          </p>
        </div>

        <button
          onClick={() => navigate(`/vehicles/${vehicleId}/reminders/new`)}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900 transition"
        >
          Create Reminder
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded border border-gray-300 px-3 py-1.5 bg-white
                     focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-gray-600">Loading reminders…</p>
      ) : reminders.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">No reminders found.</p>
          <button
            onClick={() => navigate(`/vehicles/${vehicleId}/reminders/new`)}
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-900 transition"
          >
            Create your first reminder
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reminders.map((r) => (
            <div
              key={r.reminder_id}
              className="bg-white border rounded-lg p-5 flex justify-between items-start gap-4"
            >
              {/* Left */}
              <div>
                <h4 className="font-semibold text-gray-900">
                  {r.title}
                </h4>

                <div className="mt-1 text-sm text-gray-600 space-y-0.5">
                  <div>Type: {r.reminder_type}</div>
                  <div>Priority: {r.priority}</div>
                  <div>Status: {r.status}</div>

                  {r.completed_at && (
                    <div>
                      Completed at:{" "}
                      {new Date(r.completed_at).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {r.status === "upcoming" && (
                  <button
                    onClick={() => handleComplete(r.reminder_id)}
                    disabled={busyId === r.reminder_id}
                    className="border px-3 py-1.5 rounded hover:bg-gray-50
                               disabled:opacity-50"
                  >
                    Mark Completed
                  </button>
                )}

                <button
                  onClick={() => handleDelete(r.reminder_id)}
                  disabled={busyId === r.reminder_id}
                  className="border border-red-300 text-red-600 px-3 py-1.5 rounded
                             hover:bg-red-50 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
