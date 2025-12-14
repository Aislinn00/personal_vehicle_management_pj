import { Outlet } from "react-router-dom";

export default function ProtectedLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow px-6 py-4">
        <h1 className="text-xl font-semibold">Vehicle Management</h1>
      </header>

      {/* Page content */}
      <main className="max-w-7xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
