"use client";
import { WalletProviderUI } from "./WalletProvider";

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <WalletProviderUI>{children}</WalletProviderUI>
    </>
  );
};
