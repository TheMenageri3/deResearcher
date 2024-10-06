import { useUserStore } from "@/app/store/userStore";
import { useLoading } from "@/context/LoadingContext";
import { useWallet } from "@solana/wallet-adapter-react";
import React, { useEffect } from "react";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { checkAuthAndTryLogin } = useUserStore();
  const { setIsLoading } = useLoading();

  const wallet = useWallet();

  useEffect(() => {
    const tryAuthenticate = async () => {
      setIsLoading(true);
      await checkAuthAndTryLogin(wallet);
      setIsLoading(false);
    };

    tryAuthenticate();
  }, [checkAuthAndTryLogin, setIsLoading, wallet]);

  return <>{children}</>;
};
