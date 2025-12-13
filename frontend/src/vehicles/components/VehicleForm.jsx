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
    <form onSubmit={handleSubmit}>
      <input name="make" value={form.make} onChange={handleChange} required />
      <input name="model" value={form.model} onChange={handleChange} required />
      <input name="year" value={form.year} onChange={handleChange} required />
      <input
        name="registration_number"
        value={form.registration_number}
        onChange={handleChange}
      />
      <input
        name="fuel_type"
        value={form.fuel_type}
        onChange={handleChange}
      />
      <input
        name="mileage"
        value={form.mileage}
        onChange={handleChange}
      />

      <button disabled={loading}>
        {loading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
