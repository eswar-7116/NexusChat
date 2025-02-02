import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';

export const useAuthStore = create((set) => ({
  user: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get('/check');
      set({ user: res.data });
    } catch(error) {
      console.log("Error while check auth:", error);
      set({ user: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  }
}));
