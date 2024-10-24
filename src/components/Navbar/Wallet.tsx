"use client";

import { WalletDropdown } from "@/components/WalletDropdown";
import useScreen from "@/hooks/useScreen";

export const Wallet = () => {
  const screenSize = useScreen();
  const useSimplifiedInterface = ["sm", "md", "lg"].includes(screenSize);

  return <WalletDropdown simplified={useSimplifiedInterface} />;
};
