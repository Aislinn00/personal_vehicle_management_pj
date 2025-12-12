import api from "./axios";

export const loginUser = (data) => api.post("/login", data);
export const registerUser = (data) => api.post("/register", data);
