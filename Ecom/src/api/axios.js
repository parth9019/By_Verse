import axios from "axios";

const api = axios.create({
  baseURL: "https://by-verse.onrender.com/api",
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");

    // 🔥 IMPORTANT: ensure headers object exists
    if (!config.headers) {
      config.headers = {};
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
