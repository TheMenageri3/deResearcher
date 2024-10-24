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
    researchTokenAccounts,
    fetchAndStoreResearchTokenAccounts,
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
    // const fetchResearchPapersUI = async () => {
    //   if (!sdk || papers?.length > 0) return;
    //   try {
    //     await fetchAndStorePapers();
    //   } catch (error) {
    //     console.error("Error fetching Research Papers:", error);
    //   }
    // };

    // Fetch Research Mint Collection UI
    const fetchResearchTokenAccountsUI = async () => {
      if (!sdk) {
        console.log("SDK not initialized, skipping fetch");
        return;
      }

      try {
        console.log("Starting fetch of research token accounts...");
        const response = await fetchAndStoreResearchTokenAccounts();
        console.log("Fetch response:", response);

        if (!response.success) {
          console.error(
            "Failed to fetch research token accounts:",
            response.error,
          );
        }
      } catch (error) {
        console.error("Error in fetchResearchTokenAccountsUI:", error);
      }
    };

    if (sdk) {
      fetchResearcherProfileUI();
      // fetchResearchPapersUI();
      fetchResearchTokenAccountsUI();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdk]);

  return <AppContext.Provider value={{}}>{children}</AppContext.Provider>;
};
