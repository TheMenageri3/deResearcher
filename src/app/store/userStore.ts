import { create } from "zustand";

interface UserState {
  isAuthenticated: boolean;
  wallet: string | null;
  checkAuth: () => Promise<void>;
  login: (wallet: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  isAuthenticated: false,
  wallet: null,
  checkAuth: async () => {
    try {
      const response = await fetch("/api/auth/check", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        set({
          isAuthenticated: data.isAuthenticated,
          wallet: data.wallet,
        });
      } else {
        set({ isAuthenticated: false, wallet: null });
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      set({ isAuthenticated: false, wallet: null });
    }
  },
  login: async (wallet: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet }),
        credentials: "include",
      });
      if (response.ok) {
        set({ isAuthenticated: true, wallet });
      }
    } catch (error) {
      console.error("Error logging in:", error);
      set({ isAuthenticated: false, wallet: null });
    }
  },
  logout: async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      set({ isAuthenticated: false, wallet: null });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  },
}));
