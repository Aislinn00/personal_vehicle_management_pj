import api from "./axios";

export const getMaintenanceByVehicle = (vehicleId) =>
  api.get(`/vehicles/${vehicleId}/maintenance`);

export const createMaintenance = (vehicleId, data) =>
  api.post(`/vehicles/${vehicleId}/maintenance`, data);

export const updateMaintenance = (maintenanceId, data) =>
  api.put(`/maintenance/${maintenanceId}`, data);

export const deleteMaintenance = (maintenanceId) =>
  api.delete(`/maintenance/${maintenanceId}`);
