import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL}/api`
    : import.meta.env.MODE === "development"
      ? "http://localhost:4000/api"
      : "/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});
