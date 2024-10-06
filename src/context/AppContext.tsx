import React, { createContext, useContext, useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, Cluster } from "@solana/web3.js";
import { SDK } from "@/lib/sdk";

import { CreateResearchePaper } from "@/lib/sdk";

import { ResearcherProfileType, ResearchPaperType } from "@/lib/types";

interface AppContextType {
  connection: Connection;
  sdk: SDK | null;
  papers: ResearchPaperType[];
  researcherProfile: ResearcherProfileType | null;
  isLoading: boolean;
  error: string | null;
  selectedPaper: ResearchPaperType | null;
  userId: string | null;
  setSelectedPaper: (paper: ResearchPaperType | null) => void;
  fetchPapers: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  createNewPaper: (
    paperData: Omit<CreateResearchePaper, "pdaBump">
  ) => Promise<void>;
  setUserId: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

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
  const { connection } = useConnection();
  const { publicKey, connected } = wallet;
  const [sdk, setSdk] = useState<SDK | null>(null);
  const [papers, setPapers] = useState<ResearchPaperType[]>([]);
  const [researcherProfile, setResearcherProfile] =
    useState<ResearcherProfileType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaperType | null>(
    null
  );
  const [userId, setUserId] = useState<string | null>(null);

  // Initialize SDK when wallet is connected
  useEffect(() => {
    if (connected && publicKey) {
      const cluster: Cluster = "devnet";
      const newSdk = new SDK(wallet, cluster);
    } else {
      setSdk(null);
      setPapers([]);
      setResearcherProfile(null);
      setUserId(null);
    }
  }, [connected, publicKey, wallet]);

  const fetchPapers = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/research-paper?userId=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const fetchedPapers = await response.json();

      // const validatedPapers = fetchedPapers
      //   .map((paper: unknown) => {
      //     const result = PaperSchema.safeParse(paper);
      //     if (result.success) {
      //       return result.data;
      //     } else {
      //       console.error("Invalid paper data:", paper, result.error);
      //       return null;
      //     }
      //   })
      //   .filter(
      //     (paper: ResearchPaperType | null): paper is ResearchPaperType =>
      //       paper !== null
      //   );

      setPapers(fetchedPapers);
    } catch (err) {
      setError("Failed to fetch research papers");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/research-profile?userId=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const profile = await response.json();
      // const validatedProfile = ResearcherProfileSchema.parse(profile);
      setResearcherProfile(profile);
    } catch (err) {
      setError("Failed to fetch researcher profile");
      console.error(err);
      setResearcherProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewPaper = async (
    paperData: Omit<CreateResearchePaper, "pdaBump">
  ) => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/research-paper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...paperData,
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create new paper");
      }

      await response.json();
      await fetchPapers();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create new paper");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sdk && userId) {
      fetchPapers();
      fetchProfile();
    }
  }, [sdk, userId]);

  const value = {
    connection,
    sdk,
    papers,
    researcherProfile,
    isLoading,
    error,
    selectedPaper,
    userId,
    setSelectedPaper,
    fetchPapers,
    fetchProfile,
    createNewPaper,
    setUserId,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
