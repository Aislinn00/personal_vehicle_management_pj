import { useAuth } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <p>You are logged in.</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
