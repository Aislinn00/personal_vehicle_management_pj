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
    <div className="max-w-xl bg-white border rounded-lg shadow-sm p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Create Reminder
      </h3>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            name="title"
            placeholder="e.g. Oil change reminder"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full rounded border border-gray-300 px-3 py-2
                       focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Reminder Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reminder Type
          </label>
          <select
            name="reminder_type"
            value={form.reminder_type}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-3 py-2 bg-white
                       focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="DATE">Date-based</option>
            <option value="MILEAGE">Mileage-based</option>
            <option value="BOTH">Date & Mileage</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-3 py-2 bg-white
                       focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="border px-4 py-2 rounded hover:bg-gray-50
                         disabled:opacity-50"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-6 py-2 rounded
                       hover:bg-gray-900 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
