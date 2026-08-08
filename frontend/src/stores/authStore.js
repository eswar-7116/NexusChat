import { create } from 'zustand';
import { createAuthActions } from './authSlices/authActions';
import { createProfileSlice } from './authSlices/profileSlice';
import { createSocketSlice } from './authSlices/socketSlice';

export { replyNotification } from './authSlices/socketSlice';

export const useAuthStore = create((set, get) => ({
    ...createAuthActions(set, get),
    ...createProfileSlice(set, get),
    ...createSocketSlice(set, get),
}));