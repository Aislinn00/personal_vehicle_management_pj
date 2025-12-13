import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Dashboard from "./pages/Dashboard";
import VehicleFormPage from "./vehicles/pages/VehicleFormPage";
import VehicleDetail from "./vehicles/pages/VehicleDetail";
import MaintenanceList from "./maintenance/pages/MaintenanceList";
import MaintenanceFormPage from "./maintenance/pages/MaintenanceFormPage";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles/new"
          element={
            <ProtectedRoute>
              <VehicleFormPage mode="create" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles/:id"
          element={
            <ProtectedRoute>
              <VehicleDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles/:id/edit"
          element={
            <ProtectedRoute>
              <VehicleFormPage mode="edit" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles/:id/maintenance"
          element={
            <ProtectedRoute>
              <MaintenanceList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles/:id/maintenance"
          element={
            <ProtectedRoute>
              <MaintenanceList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles/:id/maintenance/new"
          element={
            <ProtectedRoute>
              <MaintenanceFormPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
