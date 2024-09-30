"use client";
import React from "react";
import { TooltipProvider } from "../ui/tooltip";
import { WalletProviderUI } from "./WalletProvider";
import { AuthProvider } from "./AuthProvider";

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <TooltipProvider>
        <WalletProviderUI>
          <AuthProvider>{children}</AuthProvider>
        </WalletProviderUI>
      </TooltipProvider>
    </>
  );
};
