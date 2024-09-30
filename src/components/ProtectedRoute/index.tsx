"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/app/store/userStore";
import { useWallet } from "@solana/wallet-adapter-react";
import { useLoading } from "@/context/loadingContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, checkAuth, login } = useUserStore();
  const { connected, publicKey } = useWallet();
  const { setIsLoading } = useLoading();

  useEffect(() => {
    const authenticate = async () => {
      setIsLoading(true);
      await checkAuth();
      if (connected && publicKey && !isAuthenticated) {
        await login(publicKey.toString());
      }
      setIsLoading(false);
    };

    authenticate();
  }, [checkAuth, connected, publicKey, isAuthenticated, login, setIsLoading]);

  useEffect(() => {
    if (!connected || !isAuthenticated) {
      router.push("/");
    }
  }, [connected, isAuthenticated, router]);

  if (!connected || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
