import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Dashboard from "./pages/Dashboard";
import VehicleFormPage from "./vehicles/pages/VehicleFormPage";
import VehicleDetail from "./vehicles/pages/VehicleDetail";
import MaintenanceList from "./maintenance/pages/MaintenanceList";
import MaintenanceFormPage from "./maintenance/pages/MaintenanceFormPage";
import ReminderFormPage from "./reminders/pages/ReminderFormPage";
import ReminderList from "./reminders/pages/ReminderList";
import ProtectedRoute from "./routes/ProtectedRoute";
import ProtectedLayout from "./layouts/ProtectedLayout";

export default function App() {
  return (
    <BrowserRouter>
    <Navbar/>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route
          element={
            <ProtectedRoute>
              <ProtectedLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vehicles/new" element={<VehicleFormPage mode="create" />} />
          <Route path="/vehicles/:id" element={<VehicleDetail />} />
          <Route path="/vehicles/:id/edit" element={<VehicleFormPage mode="edit" />} />
          <Route path="/vehicles/:id/maintenance" element={<MaintenanceList />} />
          <Route path="/vehicles/:id/maintenance/new" element={<MaintenanceFormPage />} />
          <Route path="/vehicles/:id/reminders" element={<ReminderList />} />
          <Route path="/vehicles/:id/reminders/new" element={<ReminderFormPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
