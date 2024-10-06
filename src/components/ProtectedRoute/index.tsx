"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/app/store/userStore";
import { useWallet } from "@solana/wallet-adapter-react";
import { useLoading } from "@/context/LoadingContext";
import React from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useUserStore();
  const wallet = useWallet();

  useEffect(() => {
    if (!wallet.connected || !isAuthenticated) {
      router.push("/");
    }
  }, [wallet.connected, isAuthenticated, router]);

  if (!wallet.connected || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
