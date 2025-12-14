import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="bg-gray-50 px-4 pt-10">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-10 text-center space-y-4">
        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900">
          Personal Vehicle Management System
        </h1>

        {/* Description */}
        <p className="text-gray-600 text-lg">
          Manage your vehicles, maintenance history, reminders, and images
          securely in one centralized platform.
        </p>

        {/* Call to action */}
        <div className="pt-6">
          <Link to="/register">
            <button className="bg-black text-white px-8 py-3 rounded hover:bg-gray-900 transition">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
