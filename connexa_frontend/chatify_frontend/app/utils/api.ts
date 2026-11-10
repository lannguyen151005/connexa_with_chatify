import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("jwt_token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      const status = error?.response?.status;
      const message = error?.response?.data?.message;
      const isLockedMessage =
        typeof message === "string" &&
        (message.includes("bị khóa") || message.toLowerCase().includes("locked"));

      if (status === 403 && isLockedMessage) {
        toast.error(message, { id: "account-locked" });
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("user_id");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;