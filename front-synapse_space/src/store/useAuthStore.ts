import { create } from 'zustand';
import { CometChat } from '@cometchat/chat-sdk-javascript';

interface AuthState {
    user: CometChat.User | null;
    setCometUser: (user: CometChat.User | null) => void;
    isAuthenticated: boolean;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    setCometUser: (user) => set({ user, isAuthenticated: !!user }),
}));