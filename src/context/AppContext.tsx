import React, { createContext, useContext, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSDKStore } from "@/app/store/sdkStore";
import { useUserStore } from "@/app/store/userStore";
import { usePaperStore } from "@/app/store/paperStore";
export interface AppContextType {}

const AppContext = createContext({});

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within a AppProvider");
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const wallet = useWallet();

  const {
    researcherProfile,
    researchMintCollection,
    fetchAndStoreResearchMintCollection,
    fetchAndStoreResearcherProfile,
  } = useUserStore();

  const { papers, fetchAndStorePapers } = usePaperStore();

  const { sdk, initializeSDK } = useSDKStore();

  // Initialize SDK when wallet is connected
  useEffect(() => {
    if (wallet?.connected && wallet?.publicKey) {
      if (!sdk) {
        initializeSDK(wallet, "devnet");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet?.connected, wallet?.publicKey]);

  useEffect(() => {
    // Fetch Researcher Profile UI
    const fetchResearcherProfileUI = async () => {
      if (!sdk || researcherProfile) return;
      try {
        await fetchAndStoreResearcherProfile();
      } catch (error) {
        console.error("Error fetching Researcher Profile:", error);
      }
    };

    // Fetch Research Papers UI
    const fetchResearchPapersUI = async () => {
      if (!sdk || papers?.length > 0) return;
      try {
        await fetchAndStorePapers();
      } catch (error) {
        console.error("Error fetching Research Papers:", error);
      }
    };

    // Fetch Research Mint Collection UI
    const fetchResearchMintCollectionUI = async () => {
      if (!sdk || researchMintCollection) return;
      try {
        await fetchAndStoreResearchMintCollection();
      } catch (error) {
        console.error("Error fetching Research Mint Collection:", error);
      }
    };

    if (sdk) {
      fetchResearcherProfileUI();
      fetchResearchPapersUI();
      fetchResearchMintCollectionUI();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdk]);

  return <AppContext.Provider value={{}}>{children}</AppContext.Provider>;
};
