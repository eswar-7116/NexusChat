import { create } from 'zustand';
import { axiosInstance } from '../helpers/axios';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import { useChatStore } from './chatStore';

export const useAuthStore = create((set, get) => ({
    user: null,
    temp: "",
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
    canVibrate: localStorage.getItem("vibration") === "true" ? true : false,

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
            useChatStore.getState().listenToSocket();
        } catch (error) {
            set({ user: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data, navigate) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post('/auth/signup', data);
            if (res.data.success) {
                toast.success("Verify the OTP to register");
                set({ otpSent: true, temp: data.username });
                navigate('/verify');
            } else {
                if (!res.data.errors)
                    toast.error(res.data.message || 'Signup failed');
            }
        } catch (err) {
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
                toast.error(res.data.message || 'Verification failed');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Verification failed');
        } finally {
            set({ isVerifying: false });
        }
    },

    login: async (data, navigate) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post('/auth/login', { unameOrEmail: data.username, password: data.password });
            if (res.data.success) {
                set({ user: res.data.user });
                toast.success('Successfully logged in');
                navigate('/');
                get().connectSocket();
                useChatStore.getState().listenToSocket();
            } else {
                toast.error(res.data.message || 'Login failed');
            }
        } catch (err) {
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
                useChatStore.setState({ selectedUser: null });
            } else {
                toast.error(res.data.message || 'Logout failed');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Logout failed');
        }
    },

    changePass: async (data, navigate) => {
        set({ isChangingPass: true });
        let sentToast = false;
        try {
            delete data.confirmPassword;
            const res = await axiosInstance.post('/auth/change-password', data);
            if (res.data.success) {
                toast.success(res.data.message);
                navigate('/');
            } else {
                toast.error(res.data.message || 'Password change failed');
                sentToast = true;
            }
        } catch (err) {
            if (!sentToast)
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
                toast.error(res.data.message || 'Profile pic update failed');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Profile pic update failed');
        } finally {
            set({ isUpdatingProfilePic: false });
        }
    },

    forgotPassword: async (email) => {
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
            toast.error(err.response?.data?.message || 'Sending password reset link failed');
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
            toast.error(err.response?.data?.message || 'Password reset failed');
        }
        return false;
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

        newSocket.on('getOnlineUsers', (users) => {
            set({ onlineUsers: users });
        });

        newSocket.on('newMessage', async (message) => {
            if (get().canVibrate && "vibrate" in navigator) navigator.vibrate(120);

            const { recentUsers, allUsers, selectedUser } = useChatStore.getState();

            // Update messages only if message is from currently selected user
            useChatStore.setState((state) => ({
                messages:
                    message.senderId === selectedUser?._id
                        ? [...state.messages, message]
                        : state.messages,
            }));

            // Mark messages as read
            if (selectedUser?._id === message.senderId) {
                await axiosInstance.put(`/messaging/read-unread/${selectedUser._id}`);
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
                useChatStore.set((state) => ({
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