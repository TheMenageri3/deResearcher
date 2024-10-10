"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  Suspense,
  lazy,
} from "react";
import { ProfileInfo } from "./ProfileInfo";
import { ProfileBanner } from "./ProfileBanner";
import { ProfileTabs } from "./ProfileTabs";
import { PROFILE_COLUMNS } from "@/lib/constants";
import { useBackgroundImage } from "@/hooks/useBackgroundImage";
import { ResearcherProfileType } from "@/lib/types";
import { minimizePubkey } from "@/lib/helpers";
import Spinner from "../Spinner";

const LazyTable = lazy(() => import("@/components/Dashboard/Table"));

const fetchProfile = async (pubkey: string) => {
  const response = await fetch(
    `/api/researcher-profile?researcherPubkey=${pubkey}`,
    { cache: "no-store" },
  );
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

const getTabUrl = (tab: string, pubkey: string): string => {
  switch (tab) {
    case "contributions":
      return `/api/research?researcherPubkey=${pubkey}`;
    case "peer-reviews":
      return `/api/peer-review?reviewerPubkey=${pubkey}`;
    case "paid-reads":
      return `/api/mint?researcherPubkey=${pubkey}`;
    default:
      throw new Error(`Unsupported tab: ${tab}`);
  }
};

const fetchTabData = async (tab: string, pubkey: string) => {
  const url = getTabUrl(tab, pubkey);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();

  // NOTE: Really tricky because how the backend data is formatted
  return Array.isArray(data) ? data : [];
};

const TableContent = React.memo(
  ({
    isLoading,
    error,
    data,
  }: {
    isLoading: boolean;
    error: Error | null;
    data: any;
  }) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          Loading data...
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex items-center justify-center h-64 text-red-500">
          Error loading data: {error.message}
        </div>
      );
    }
    return <LazyTable columns={PROFILE_COLUMNS} data={data} />;
  },
);

TableContent.displayName = "TableContent";

export default function ProfileComponent({ pubkey }: { pubkey: string }) {
  const [profileState, setProfileState] = useState({
    user: null as ResearcherProfileType | null,
    isLoading: true,
    error: null as Error | null,
  });

  const [tabState, setTabState] = useState<{
    activeTab: string;
    data: any[];
    isLoading: boolean;
    error: Error | null;
  }>({
    activeTab: "contributions",
    data: [],
    isLoading: false,
    error: null,
  });

  const {
    backgroundImage,
    isNewBackgroundImage,
    handleEditClick,
    handleSaveClick,
  } = useBackgroundImage();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const memoizedFormatTableData = useMemo(() => {
    return (paperData: any) => {
      const paper = paperData.researchPaper;

      return {
        address: paper.address || "N/A",
        title: paper.metadata?.title || "Untitled",
        authors: Array.isArray(paper.metadata?.authors)
          ? paper.metadata.authors.join(", ")
          : "Unknown",
        createdDate: formatDate(paper.createdAt),
        domains: Array.isArray(paper.metadata?.tags)
          ? paper.metadata.tags.join(", ")
          : "N/A",
        status: paper.state || "Unknown",
        minted: paper.totalMints || 0,
      };
    };
  }, []);

  const formatDate = (dateInput: any): string => {
    if (!dateInput) return "N/A";
    if (dateInput.$date) {
      return new Date(dateInput.$date).toISOString().split("T")[0];
    }
    if (typeof dateInput === "string") {
      return dateInput.split("T")[0];
    }
    if (typeof dateInput === "number") {
      return new Date(dateInput).toISOString().split("T")[0];
    }
    return "N/A";
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        const profileData = await fetchProfile(pubkey);
        setProfileState((prev) => ({
          ...prev,
          user: profileData,
          isLoading: false,
        }));
      } catch (error) {
        setProfileState((prev) => ({
          ...prev,
          error: error as Error,
          isLoading: false,
        }));
      }
    }

    loadProfile();
  }, [pubkey]);

  useEffect(() => {
    async function loadTabData() {
      setTabState((prev) => ({ ...prev, isLoading: true }));
      try {
        const newData = await fetchTabData(tabState.activeTab, pubkey);
        setTabState((prev) => ({
          ...prev,
          data: newData as any[],
          isLoading: false,
        }));
      } catch (error) {
        setTabState((prev) => ({
          ...prev,
          error: error as Error,
          isLoading: false,
        }));
      }
    }

    loadTabData();
  }, [tabState.activeTab, pubkey]);

  const handleTabChange = (tab: string) => {
    setTabState((prev) => ({
      ...prev,
      activeTab: tab,
      isLoading: true,
    }));
  };

  if (profileState.isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <Spinner />
      </div>
    );
  }

  if (profileState.error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div>Error loading profile: {profileState.error.message}</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 mb-20">
      <ProfileBanner
        avatarSrc={
          profileState.user?.metadata?.profileImageURI || "/avatar.png"
        }
        onEditClick={handleEditClick}
        onSaveClick={handleSaveClick}
        isVerified={true}
        backgroundImage={backgroundImage}
        isNewBackgroundImage={isNewBackgroundImage}
      />

      <ProfileInfo
        name={profileState.user?.name || ""}
        organization={profileState.user?.metadata?.organization || ""}
        walletAddress={minimizePubkey(pubkey)}
        fullWalletAddress={pubkey}
        socialLink={profileState.user?.metadata?.socialLinks?.[0] || ""}
        bio={profileState.user?.metadata?.bio || ""}
        stats={{
          papers: profileState.user?.totalPapersPublished || 0,
          reviewedPapers: profileState.user?.totalReviews || 0,
          reputation: profileState.user?.reputation || 0,
        }}
      />

      <ProfileTabs
        activeTab={tabState.activeTab}
        setActiveTab={handleTabChange}
      />

      <div className="relative h-[calc(100vh-400px)]">
        <div
          ref={tableContainerRef}
          className="absolute inset-0 overflow-y-auto scroll-smooth focus:outline-none"
        >
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full bg-white bg-opacity-80">
                Loading table...
              </div>
            }
          >
            <TableContent
              isLoading={tabState.isLoading}
              error={tabState.error}
              data={tabState.data.map(memoizedFormatTableData)}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
