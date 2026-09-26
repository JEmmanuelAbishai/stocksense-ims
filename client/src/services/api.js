import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the auth token to every request, if we have one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("stocksense_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralized handling for expired/invalid sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("stocksense_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;