import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <Link to="/" className="text-lg font-semibold">
            PVMS
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex space-x-6">
            <Link
              to="/login"
              className="hover:text-gray-300 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="hover:text-gray-300 transition"
            >
              Register
            </Link>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {open ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-black border-t border-gray-700">
          <Link
            to="/login"
            className="block px-4 py-3 hover:bg-gray-800"
            onClick={() => setOpen(false)}
          >
            Login
          </Link>
          <Link
            to="/register"
            className="block px-4 py-3 hover:bg-gray-800"
            onClick={() => setOpen(false)}
          >
            Register
          </Link>
        </div>
      )}
    </nav>
  );
}
