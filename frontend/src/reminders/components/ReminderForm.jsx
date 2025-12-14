import { useState } from "react";

const initialState = {
  title: "",
  reminder_type: "DATE",
  priority: "medium",
};

export default function ReminderForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        title: form.title.trim(),
        reminder_type: form.reminder_type,
        priority: form.priority,
      });
      setForm(initialState);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to save reminder.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: "1px solid #ddd", padding: "1rem" }}>
      <h3>Create Reminder</h3>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div>
        <label>Title</label>
        <br />
        <input
          name="title"
          placeholder="e.g. Oil change reminder"
          value={form.title}
          onChange={handleChange}
        />
      </div>

      <div style={{ marginTop: "0.75rem" }}>
        <label>Reminder Type</label>
        <br />
        <select
          name="reminder_type"
          value={form.reminder_type}
          onChange={handleChange}
        >
          <option value="DATE">Date-based</option>
          <option value="MILEAGE">Mileage-based</option>
          <option value="BOTH">Date & Mileage</option>
        </select>
      </div>

      <div style={{ marginTop: "0.75rem" }}>
        <label>Priority</label>
        <br />
        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{ marginLeft: "0.5rem" }}
            disabled={loading}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
