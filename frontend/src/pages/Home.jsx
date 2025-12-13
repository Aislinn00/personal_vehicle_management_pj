import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Personal Vehicle Management System</h1>

      <p>
        Manage your vehicles, maintenance history, reminders, and images
        in one place.
      </p>

      <h3>What you can do:</h3>
      <ul>
        <li>Register and manage multiple vehicles</li>
        <li>Upload vehicle images securely (Azure Blob Storage)</li>
        <li>Track maintenance and service history</li>
        <li>Set reminders for upcoming services</li>
      </ul>

      <div style={{ marginTop: "1.5rem" }}>
        <Link to="/login">
          <button>Login</button>
        </Link>

        <Link to="/register" style={{ marginLeft: "1rem" }}>
          <button>Register</button>
        </Link>
      </div>
    </div>
  );
}
