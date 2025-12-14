import api from "../api/axios";

// GET reminders for a vehicle (filter)
export const getRemindersByVehicle = (vehicleId, status) =>
  api.get(`/vehicles/${vehicleId}/reminders`, {
    params: status ? { status } : {},
  });

// CREATE reminder
export const createReminder = (vehicleId, data) =>
  api.post(`/vehicles/${vehicleId}/reminders`, data);

// MARK completed
export const completeReminder = (reminderId) =>
  api.put(`/reminders/${reminderId}/complete`);

// SOFT delete
export const deleteReminder = (reminderId) =>
  api.delete(`/reminders/${reminderId}`);
