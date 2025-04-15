import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_MODE === 'development' ? `${import.meta.env.VITE_BACKEND_URL}/backend` : import.meta.env.VITE_BACKEND_URL,
    withCredentials: true
});