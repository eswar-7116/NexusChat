import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import { toast } from 'react-hot-toast';

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
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post('/auth/signup', data);
      console.log("Data:", data);
      console.log("Response:", res);
      toast.success(res.data.message);
      set({ user: res.data });
    } catch (err) {
      console.log("Error while signing up:", err);
      toast.error(err.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  }
}));
