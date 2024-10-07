"use client";
import React from "react";
import { TooltipProvider } from "../ui/tooltip";
import { WalletProviderUI } from "./WalletProvider";
import { AuthProvider } from "./AuthProvider";
import { AppProvider } from "../../context/AppContext";

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <TooltipProvider>
      <WalletProviderUI>
        <AppProvider>
          <AuthProvider>{children}</AuthProvider>
        </AppProvider>
      </WalletProviderUI>
    </TooltipProvider>
  );
};
