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
    <div>
      <h2>Reminders</h2>

      <button onClick={() => navigate(-1)}>Back to Vehicle</button>
      <button
        onClick={() => navigate(`/vehicles/${vehicleId}/reminders/new`)}
        style={{ marginLeft: "0.5rem" }}
      >
        Create Reminder
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginTop: "1rem" }}>
        <label>Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ marginLeft: "0.5rem" }}
        >
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {loading ? (
        <p>Loading reminders...</p>
      ) : reminders.length === 0 ? (
        <p>No reminders found.</p>
      ) : (
        <ul style={{ marginTop: "1rem" }}>
          {reminders.map((r) => (
            <li key={r.reminder_id} style={{ marginBottom: "1rem" }}>
              <strong>{r.title}</strong>
              <br />
              Type: {r.reminder_type}
              <br />
              Priority: {r.priority}
              <br />
              Status: {r.status}
              {r.completed_at && (
                <div>
                  Completed at:{" "}
                  {new Date(r.completed_at).toLocaleString()}
                </div>
              )}

              <div style={{ marginTop: "0.5rem" }}>
                {r.status === "upcoming" && (
                  <button
                    onClick={() => handleComplete(r.reminder_id)}
                    disabled={busyId === r.reminder_id}
                  >
                    Mark Completed
                  </button>
                )}

                <button
                  onClick={() => handleDelete(r.reminder_id)}
                  disabled={busyId === r.reminder_id}
                  style={{ marginLeft: "0.5rem" }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
