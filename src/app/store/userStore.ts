import { create } from "zustand";

interface UserState {
  isAuthenticated: boolean;
  wallet: string | null;
  checkAuth: () => Promise<void>;
  login: (wallet: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  lastChecked: number;
}

const AUTH_CHECK_INTERVAL = 10 * 60 * 1000; // 10 minute

export const useUserStore = create<UserState>((set, get) => ({
  isAuthenticated: false,
  wallet: null,
  isLoading: false,
  lastChecked: 0,
  checkAuth: async () => {
    const { isLoading, lastChecked } = get();
    const now = Date.now();
    if (isLoading || now - lastChecked < AUTH_CHECK_INTERVAL) return;

    set({ isLoading: true });
    try {
      const response = await fetch("/api/auth/check", {
        credentials: "include",
      });
      const data = await response.json();
      set({
        isAuthenticated: data.isAuthenticated,
        wallet: data.wallet,
        lastChecked: now,
      });
    } catch (error) {
      console.error("Auth check failed:", error);
      set({ isAuthenticated: false, wallet: null });
    } finally {
      set({ isLoading: false });
    }
  },
  login: async (wallet: string) => {
    const { isAuthenticated, wallet: currentWallet } = get();
    if (isAuthenticated && currentWallet === wallet) return;

    set({ isLoading: true });
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet }),
        credentials: "include",
      });
      if (response.ok) {
        set({ isAuthenticated: true, wallet, lastChecked: Date.now() });
      }
    } catch (error) {
      console.error("Error logging in:", error);
    } finally {
      set({ isLoading: false });
    }
  },
  logout: async () => {
    set({ isLoading: true });
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      set({ isAuthenticated: false, wallet: null, lastChecked: Date.now() });
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
