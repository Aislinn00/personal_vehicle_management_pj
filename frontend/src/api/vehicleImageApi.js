import api from "./axios";

// GET images for a vehicle
export const getVehicleImages = (vehicleId) =>
  api.get(`/vehicles/${vehicleId}/images`);

// UPLOAD image
export const uploadVehicleImage = (vehicleId, file) => {
  const formData = new FormData();
  formData.append("image", file);

  return api.post(`/vehicles/${vehicleId}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// DELETE image
export const deleteVehicleImage = (photoId) =>
  api.delete(`/vehicle-images/${photoId}`);
