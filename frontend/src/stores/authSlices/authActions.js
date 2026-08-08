import { axiosInstance } from '../../helpers/axios';
import { toast } from 'react-hot-toast';
import { useChatStore } from '../chatStore';

export const createAuthActions = (set, get) => ({
    user: null,
    usernameToVerify: "",

    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,
    otpSent: false,
    isVerifying: false,
    isChangingPass: false,
    isSendingResetLink: false,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get('/check');
            set({ user: res.data.user });
            get().connectSocket();
        } catch (err) {
            console.error("Auth check failed:", err?.response?.data?.message || err?.message || "Unknown error");
            set({ user: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data, navigate) => {
        // Prevent multiple signup attempts while one is in progress
        if (get().isSigningUp) return;

        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post('/auth/signup', data);
            if (res.data.success) {
                toast.success("Verify the OTP to register");
                set({ otpSent: true, usernameToVerify: data.username });
                navigate('/verify');
            } else {
                if (!res.data.errors)
                    toast.error(res.data.message || 'Signup failed');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Signup failed';
            console.error("Signup error:", err);
            toast.error(errorMsg);
        } finally {
            set({ isSigningUp: false });
        }
    },

    verify: async (otp, navigate) => {
        // Prevent multiple verify attempts while one is in progress
        if (get().isVerifying) return;

        set({ isVerifying: true });
        try {
            const res = await axiosInstance.post('/auth/verify-user-otp', { otp, username: get().usernameToVerify });
            if (res.data.success) {
                toast.success(res.data.message);
                navigate('/login');
            } else {
                toast.error(res.data.message || 'Verification failed');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Verification failed';
            console.error("Verification error:", err);
            toast.error(errorMsg);
        } finally {
            set({ isVerifying: false });
        }
    },

    login: async (data, navigate) => {
        // Prevent multiple login attempts while one is in progress
        if (get().isLoggingIn) return;

        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post('/auth/login', { unameOrEmail: data.username, password: data.password });
            if (res.data.success) {
                set({ user: res.data.user });
                toast.success('Successfully logged in');
                navigate('/');
                get().connectSocket();
            } else {
                toast.error(res.data.message || 'Login failed');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Login failed';
            console.error("Login error:", err);
            toast.error(errorMsg);
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async (navigate) => {
        try {
            const res = await axiosInstance.post('/auth/logout');
            if (res.data.success) {
                // Disconnect socket before clearing user data
                get().disconnectSocket();

                set({ user: null });
                toast.success("Successfully logged out");
                navigate('/login');
                useChatStore.setState({ selectedUser: null });
            } else {
                toast.error(res.data.message || 'Logout failed');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Logout failed';
            console.error("Logout error:", err);
            toast.error(errorMsg);
        }
    },

    changePass: async (data, navigate) => {
        // Prevent multiple password change attempts while one is in progress
        if (get().isChangingPass) return;

        set({ isChangingPass: true });
        try {
            delete data.confirmPassword;
            const res = await axiosInstance.post('/auth/change-password', data);
            if (res.data.success) {
                toast.success(res.data.message);
                navigate('/');
            } else {
                toast.error(res.data.message || 'Password change failed');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Password change failed';
            console.error("Password change error:", err);
            toast.error(errorMsg);
        } finally {
            set({ isChangingPass: false });
        }
    },

    forgotPassword: async (email) => {
        // Prevent multiple reset link attempts while one is in progress
        if (get().isSendingResetLink) return;

        set({ isSendingResetLink: true });
        try {
            const res = await axiosInstance.post('/auth/forgot-password', { email });
            if (res.data.success) {
                toast.success(res.data.message);
                return true;
            } else {
                toast.error(res.data.message || 'Sending password reset link failed');
                return false;
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Sending password reset link failed';
            console.error("Reset link error:", err);
            toast.error(errorMsg);
            return false;
        } finally {
            set({ isSendingResetLink: false });
        }
    },

    resetPassword: async (userId, password, token) => {
        try {
            const res = await axiosInstance.post('/auth/reset-password', { userId, password, token });
            if (res.data.success) {
                toast.success(res.data.message);
                return true;
            } else {
                toast.error(res.data.message || 'Password reset failed');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Password reset failed';
            console.error("Password reset error:", err);
            toast.error(errorMsg);
        }
        return false;
    },

    resendOtp: async (userId) => {
        try {
            const res = await axiosInstance.get(`/auth/resend-otp/${get().usernameToVerify}`);
            if (res.data.success) {
                toast.success(res.data.message);
            } else {
                toast.error(res.data.message || 'else Couldn\'t resend OTP');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Couldn\'t resend OTP';
            console.error("Error while resending OTP: ", err);
            toast.error(errorMsg);
        }
    },
});
