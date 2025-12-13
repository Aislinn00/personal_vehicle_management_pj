import { useEffect, useState } from "react";

const initialState = {
  service_date: "",
  maintenance_type: "",
  cost: "",
  maintenance_status: "upcoming",
};

export default function MaintenanceForm({ initialData, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        service_date: initialData.service_date,
        maintenance_type: initialData.maintenance_type,
        cost: initialData.cost,
        maintenance_status: initialData.maintenance_status,
      });
    }
  }, [initialData]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await onSubmit({
      ...form,
      cost: Number(form.cost),
    });

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{initialData ? "Edit Maintenance" : "Create Maintenance"}</h3>

      <input
        type="date"
        name="service_date"
        value={form.service_date}
        onChange={handleChange}
        required
      />

      <input
        name="maintenance_type"
        placeholder="Maintenance Type"
        value={form.maintenance_type}
        onChange={handleChange}
        required
      />

      <input
        type="number"
        name="cost"
        placeholder="Cost"
        value={form.cost}
        onChange={handleChange}
        required
      />

      <select
        name="maintenance_status"
        value={form.maintenance_status}
        onChange={handleChange}
      >
        <option value="upcoming">Upcoming</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>

      <button disabled={loading}>
        {loading ? "Saving..." : "Save"}
      </button>

      {onCancel && (
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      )}
    </form>
  );
}
