import { create } from 'zustand';
import { axiosInstance } from '../helpers/axios';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import { useChatStore } from './chatStore';

export const replyNotification = new Audio("/notification.mp3");

export const useAuthStore = create((set, get) => ({
    user: null,
    usernameToVerify: "",
    onlineUsers: [],
    socket: null,
    theme: (() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("theme");
            if (saved) return saved;
            return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        return "light";
    })(),
    canVibrate: localStorage.getItem("vibration") !== "false",

    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,
    otpSent: false,
    isVerifying: false,
    isChangingPass: false,
    isUpdatingProfilePic: false,
    isSendingResetLink: false,

    changeTheme: () => {
        const theme = get().theme === "light" ? "dark" : "light";
        localStorage.setItem("theme", theme);
        set({ theme });
    },

    toggleVibration: () => {
        const newCanVibrate = !get().canVibrate;
        localStorage.setItem("vibration", newCanVibrate);
        set({ canVibrate: newCanVibrate });
    },

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

    updateProfilePic: async (data) => {
        // Prevent multiple profile pic updates while one is in progress
        if (get().isUpdatingProfilePic) return;

        set({ isUpdatingProfilePic: true });
        try {
            const res = await axiosInstance.post('/auth/edit-profile', data);
            if (res.data.success) {
                set({ user: res.data.user });
                toast.success(res.data.message);
            } else {
                toast.error(res.data.message || 'Profile pic update failed');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Profile pic update failed';
            console.error("Profile pic update error:", err);
            toast.error(errorMsg);
        } finally {
            set({ isUpdatingProfilePic: false });
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

    connectSocket: () => {
        const { user, socket } = get();
        // If user is not logged in, return
        if (!user) return;

        // If socket is already connected, disconnect it
        if (socket?.connected)
            socket.disconnect();

        const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
            query: { userId: user._id }
        });
        newSocket.connect();

        // All socket event handlers
        newSocket.on('getOnlineUsers', (users) => {
            set({ onlineUsers: users });
        });

        newSocket.on('newMessage', async (message) => {
            const { selectedUser } = useChatStore.getState();
            const shouldNotify = message.senderId !== selectedUser?._id;

            // Vibrate if setting enabled
            if (get().canVibrate && "vibrate" in navigator) navigator.vibrate(120);

            // Play notification sound if the message is not from the selected user
            if (shouldNotify) {
                replyNotification.play().catch((err) =>
                    console.error("Notification sound error:", err)
                );
            }

            const { recentUsers, allUsers } = useChatStore.getState();

            // Update messages only if message is from currently selected user
            useChatStore.setState((state) => ({
                messages:
                    message.senderId === selectedUser?._id
                        ? [...state.messages, message]
                        : state.messages,
            }));

            // Mark messages as read
            if (selectedUser?._id === message.senderId) {
                try {
                    await axiosInstance.put(`/messaging/read-unread/${selectedUser._id}`);
                } catch (err) {
                    console.error("Error marking messages as read:", err?.message);
                }
            }

            // Get the sender from allUsers
            const sender = allUsers.find((user) => user._id === message.senderId);
            if (!sender) return;

            // Update recentUsers
            const updatedRecentUsers = [
                sender,
                ...recentUsers.filter((user) => user._id !== sender._id),
            ];

            useChatStore.setState({ recentUsers: updatedRecentUsers });
        });

        newSocket.on("messagesRead", (readByUserId) => {
            if (readByUserId === useChatStore.getState().selectedUser?._id) {
                const currentUserId = get().user._id;
                useChatStore.setState((state) => ({
                    messages: state.messages.map((msg) =>
                        msg.senderId === currentUserId && !msg.isRead
                            ? { ...msg, isRead: true }
                            : msg
                    )
                }));
            }
        });

        newSocket.on("deleteForMe", ({ msgId, deletedByUserId }) => {
            useChatStore.set((state) => ({
                messages: state.messages.map((msg) =>
                    msg._id === msgId
                        ? {
                            ...msg,
                            deletedFor: msg.deletedFor
                                ? [...msg.deletedFor, deletedByUserId]
                                : [deletedByUserId]
                        }
                        : msg
                )
            }));
        });

        newSocket.on("deleteForEveryone", ({ msgId, deletedByUserId }) => {
            useChatStore.set((state) => {
                const messages = [...state.messages];
                const msg = messages.find((m) => m._id === msgId);
                if (msg) msg.deletedForEveryoneBy = deletedByUserId;
                return { messages };
            });
        });

        newSocket.on("blocked", (blockedByUserId) => {
            if (useChatStore.getState().selectedUser?._id === blockedByUserId) {
                useChatStore.setState({ blocked: true });
            }
        });

        newSocket.on("unblocked", (blockedByUserId) => {
            if (useChatStore.getState().selectedUser?._id === blockedByUserId) {
                useChatStore.setState({ blocked: false });
            }
        });

        newSocket.on("userAdded", (user) => {
            useChatStore.setState({
                allUsers: [...useChatStore.getState().allUsers, user]
            });
        });

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