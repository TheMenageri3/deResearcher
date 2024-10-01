import { WalletContextState } from "@solana/wallet-adapter-react";
import { create } from "zustand";
import bs58 from "bs58";
import { getEncodedLoginMessage, verifySignature } from "@/lib/helpers";

interface UserState {
  isAuthenticated: boolean;
  walletSignature: string | null;
  wallet: string | null;
  checkAuth: (walletPubkey: string) => Promise<void>;
  checkAuthAndTryLogin: (wallet: WalletContextState) => Promise<void>;
  logout: (walletPubkey: string) => Promise<void>;
  isLoading: boolean;
  lastChecked: number;
}

export type UserStore = UserState;

const AUTH_CHECK_INTERVAL = 10 * 60 * 1000; // 10 minute

export const useUserStore = create<UserState>((set, get) => ({
  isAuthenticated: false,
  walletSignature: null,
  wallet: null,
  isLoading: false,
  lastChecked: 0,
  checkAuthAndTryLogin: async (wallet: WalletContextState) => {
    if (!wallet.publicKey) {
      return;
    }
    const { isLoading, lastChecked } = get();
    const now = Date.now();
    if (isLoading || now - lastChecked < AUTH_CHECK_INTERVAL) return;

    set({ isLoading: true });
    try {
      const checkAuthResponse = await fetch("/api/auth/check", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ walletPubkey: wallet.publicKey.toString() }),
      });
      const checkAuthResponseData = await checkAuthResponse.json();
      console.log("Auth check response:", checkAuthResponseData.data);
      const data = checkAuthResponseData.data;
      const { isAuthenticated, walletSignature } = data;
      set({
        isAuthenticated,
        walletSignature,
        wallet: wallet.publicKey.toString(),
        lastChecked: now,
      });

      if (isAuthenticated) return;

      if (!wallet.signMessage) {
        return;
      }

      const encodedMessage = getEncodedLoginMessage(
        wallet.publicKey.toBase58()
      );
      const signature = await wallet.signMessage(encodedMessage);

      const encodedSignature = bs58.encode(signature);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletSignature: encodedSignature,
          walletPubkey: wallet.publicKey.toString(),
        }),
        credentials: "include",
      });
      if (response.ok) {
        set({
          isAuthenticated: true,
          walletSignature: encodedSignature,
          wallet: wallet.publicKey.toString(),
          lastChecked: Date.now(),
        });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      set({ isAuthenticated: false, lastChecked: now });
    } finally {
      set({ isLoading: false });
    }
  },

  checkAuth: async (walletPubkey: string) => {
    const { isLoading, lastChecked } = get();
    const now = Date.now();
    if (isLoading || now - lastChecked < AUTH_CHECK_INTERVAL) return;

    set({ isLoading: true });
    try {
      const response = await fetch("/api/auth/check", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ walletPubkey }),
      });
      const responseData = await response.json();
      console.log("Auth check response:", responseData.data);
      const data = responseData.data;
      const { isAuthenticated } = data;
      set({
        isAuthenticated,
        lastChecked: now,
      });
    } catch (error) {
      console.error("Auth check failed:", error);
      set({ isAuthenticated: false, lastChecked: now });
    }
  },

  logout: async (walletPubkey: string) => {
    set({ isLoading: true });
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ walletPubkey }),
      });
      set({
        isAuthenticated: false,
        walletSignature: null,
        wallet: null,
        lastChecked: Date.now(),
      });
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
