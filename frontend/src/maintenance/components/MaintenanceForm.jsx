import { useEffect, useState } from "react";

const today = new Date().toISOString().split("T")[0];
const initialState = {
  service_date: "",
  type: "",
  cost: "",
  maintenance_status: "pending", 
};

export default function MaintenanceForm({ initialData, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        service_date: initialData.service_date ?? "",
        type: initialData.type ?? "",
        cost: initialData.cost ?? "",
        maintenance_status: initialData.maintenance_status ?? "pending",
      });
    }
  }, [initialData]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        ...form,
        cost: Number(form.cost),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 pt-10">
      <div className="max-w-2xl mx-auto bg-white border rounded-lg shadow-sm p-8">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6">
          {initialData ? "Edit Maintenance" : "Create Maintenance"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Date
            </label>
            <input
              type="date"
              name="service_date"
              value={form.service_date}
              onChange={handleChange}
              required
              max={today} 
              className="w-full rounded border border-gray-300 px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Maintenance Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maintenance Type
            </label>
            <input
              name="type"          
              value={form.type}
              onChange={handleChange}
              required
              placeholder="e.g. Oil Change, Brake Service"
              className="w-full rounded border border-gray-300 px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Cost */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cost
            </label>
            <input
              type="number"
              name="cost"
              value={form.cost}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              className="w-full rounded border border-gray-300 px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="maintenance_status"
              value={form.maintenance_status}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 px-3 py-2 bg-white
                         focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="border px-4 py-2 rounded hover:bg-gray-50"
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
    </div>
  );
}
