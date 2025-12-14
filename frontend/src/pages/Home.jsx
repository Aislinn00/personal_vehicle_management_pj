import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-3xl bg-white rounded-lg shadow p-8 space-y-6">
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Personal Vehicle Management System
        </h1>

        {/* Description */}
        <p className="text-gray-600 text-center">
          Manage your vehicles, maintenance history, reminders, and images
          in one secure and convenient place.
        </p>

        {/* Actions */}
        <div className="flex justify-center gap-4 pt-4">
          <Link to="/login">
            <button className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition">
              Login
            </button>
          </Link>

          <Link to="/register">
            <button className="px-6 py-2 rounded border border-blue-600 text-blue-600 hover:bg-blue-50 transition">
              Register
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
