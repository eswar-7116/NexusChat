import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_MODE !== "production"
      ? `${import.meta.env.VITE_BACKEND_URL}/backend`
      : "/backend",
  withCredentials: true,
});
