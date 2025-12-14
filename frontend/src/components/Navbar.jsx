import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <Link to="/" className="text-lg font-semibold">
            PVMS
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            {!token ? (
              <>
                <Link to="/login" className="hover:text-gray-300">
                  Login
                </Link>
                <Link to="/register" className="hover:text-gray-300">
                  Register
                </Link>
              </>
            ) : (
              <>
                <span className="text-sm text-gray-300">{user?.full_name}</span>

                <button
                  onClick={handleLogout}
                  className="border border-gray-500 px-3 py-1 rounded hover:bg-gray-800"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button onClick={() => setOpen(!open)} className="md:hidden">
            ☰
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-black border-t border-gray-700">
          {!token ? (
            <>
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
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-3 hover:bg-gray-800"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
