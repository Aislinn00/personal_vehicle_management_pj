import { useEffect, useState } from "react";

const initialState = {
  make: "",
  model: "",
  year: "",
  registration_number: "",
  fuel_type: "",
  mileage: "",
};

export default function VehicleForm({ mode, initialData, onSubmit }) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm(initialData);
    }
  }, [mode, initialData]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await onSubmit({
      ...form,
      year: Number(form.year),
      mileage: form.mileage ? Number(form.mileage) : null,
    });

    setLoading(false);
  };

  return (
    <div className="px-4 pt-10">
      <div className="max-w-2xl mx-auto bg-white border rounded-lg shadow-sm p-8">
        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          {mode === "edit" ? "Edit Vehicle" : "Add Vehicle"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Make & Model */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Make
              </label>
              <input
                name="make"
                value={form.make}
                onChange={handleChange}
                required
                className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <input
                name="model"
                value={form.model}
                onChange={handleChange}
                required
                className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* Year & Registration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <input
                type="number"
                name="year"
                value={form.year}
                onChange={handleChange}
                required
                className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Number
              </label>
              <input
                name="registration_number"
                value={form.registration_number}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* Fuel Type & Mileage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fuel Type
              </label>
              <input
                name="fuel_type"
                value={form.fuel_type}
                onChange={handleChange}
                placeholder="e.g. Petrol, Diesel"
                className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mileage
              </label>
              <input
                type="number"
                name="mileage"
                value={form.mileage}
                onChange={handleChange}
                placeholder="Optional"
                className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-6 py-2 rounded hover:bg-gray-900 transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
