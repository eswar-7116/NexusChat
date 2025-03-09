import { create } from 'zustand';
import { axiosInstance } from '../helpers/axios';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';

export const useAuthStore = create((set, get) => ({
  user: null,
  temp: "",
  onlineUsers: [],
  socket: null,
  
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  otpSent: false,
  isVerifying: false,
  isChangingPass: false,
  isUpdatingProfilePic: false,
  
  theme: localStorage.getItem("theme") === null ?
    window.matchMedia("(prefers-color-scheme: dark)").matches ?
      "dark" : "light" :
    localStorage.getItem("theme"),

  changeTheme: () => {
    const theme = get().theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", theme);
    set({ theme: theme });
  },

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get('/check');
      set({ user: res.data.user });
      get().connectSocket();
    } catch(error) {
      console.log("Error while check auth:", error);
      set({ user: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data, navigate) => {
    set({ isSigningUp: true });
    try {
      delete data.confirmPassword;
      const res = await axiosInstance.post('/auth/signup', data);
      if (res.data.success) {
        toast.success("Verify the OTP to register");
        set({ otpSent: true, temp: data.username });
        navigate('/verify');
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.log("Error while signing up:", err);
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      set({ isSigningUp: false });
    }
  },

  verify: async (otp, navigate) => {
    set({ isVerifying: true });
    try {
      const res = await axiosInstance.post('/auth/verify-user-otp', { otp, username: get().temp });
      if (res.data.success) {
        toast.success(res.data.message);
        navigate('/login');
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.log("Error while verifying OTP:", err);
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      set({ isVerifying: false });
    }
  },

  login: async (data, navigate) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post('/auth/login', { username: data.username, password: data.password });
      if (res.data.success) {
        set({ user: res.data.user });
        toast.success('Successfully logged in');
        navigate('/');
        get().connectSocket();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.log("Error while logging in:", err);
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async (navigate) => {
    try {
      const res = await axiosInstance.post('/auth/logout');
      if (res.data.success) {
        set({ user: null });
        toast.success("Successfully logged out");
        navigate('/login');
        get().disconnectSocket();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.log("Error while logging in:", err);
      toast.error(err.response?.data?.message || 'Logout failed');
    }
  },

  changePass: async (data, navigate) => {
    set({ isChangingPass: true });
    try {
      delete data.confirmPassword;
      const res = await axiosInstance.post('/auth/change-password', data);
      if (res.data.success) {
        toast.success(res.data.message);
        navigate('/');
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.log("Error while changing password:", err);
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      set({ isChangingPass: false });
    }
  },

  updateProfilePic: async (data) => {
    set({ isUpdatingProfilePic: true });
    try {
      const res = await axiosInstance.post('/auth/edit-profile', data);
      if (res.data.success) {
        set({ user: res.data.user });
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.log("Error while updating profile pic:", err);
      toast.error(err.response?.data?.message || 'Profile pic update failed');
    } finally {
      set({ isUpdatingProfilePic: false });
    }
  },

  connectSocket: () => {
    const { user, socket } = get();
    if (!user || socket?.connected) return;

    const newSocket = io('http://localhost:5000');
    newSocket.connect();
    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.disconnect();
      set({ socket: null });
    }
  }
}));