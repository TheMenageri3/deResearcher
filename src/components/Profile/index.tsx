"use client";

import React, { useState, useRef, useEffect, useMemo, Suspense } from "react";
import { ProfileInfo } from "./ProfileInfo";
import { ProfileBanner } from "./ProfileBanner";
import { ProfileTabs } from "./ProfileTabs";
import { useBackgroundImage } from "@/hooks/useBackgroundImage";
import { ResearcherProfileType } from "@/lib/types";
import { minimizePubkey, formatDate } from "@/lib/helpers";
import { fetchProfile, fetchTabData } from "@/lib/apis";
import Spinner from "../Spinner";
import TableContent from "./TableContent";

export default function ProfileComponent({ pubkey }: { pubkey: string }) {
  const [totalPapers, setTotalPapers] = useState(0);
  const [profileState, setProfileState] = useState<{
    user: ResearcherProfileType | null;
    isLoading: boolean;
    error: Error | null;
  }>({
    user: null,
    isLoading: true,
    error: null,
  });
  const [tabState, setTabState] = useState<{
    activeTab: string;
    data: any[]; // Change this from never[] to any[]
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

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await fetchProfile(pubkey);
        setProfileState({ user: profileData, isLoading: false, error: null });
      } catch (error) {
        setProfileState((prev) => ({
          ...prev,
          error: error as Error,
          isLoading: false,
        }));
      }
    };

    const fetchTotalPapers = async () => {
      try {
        const data = await fetchTabData("contributions", pubkey);
        setTotalPapers(Array.isArray(data) ? data.length : 0);
      } catch (error) {
        console.error("Error fetching total papers:", error);
      }
    };

    loadProfile();
    fetchTotalPapers();
  }, [pubkey]);

  useEffect(() => {
    const loadTabData = async () => {
      setTabState((prev) => ({ ...prev, isLoading: true }));
      try {
        const newData = await fetchTabData(tabState.activeTab, pubkey);
        setTabState((prev) => ({ ...prev, data: newData, isLoading: false }));
      } catch (error) {
        setTabState((prev) => ({
          ...prev,
          error: error as Error,
          isLoading: false,
        }));
      }
    };

    loadTabData();
  }, [tabState.activeTab, pubkey]);

  const handleTabChange = (tab: string) =>
    setTabState((prev) => ({ ...prev, activeTab: tab, isLoading: true }));

  if (profileState.isLoading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <Spinner />
      </div>
    );
  if (profileState.error)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        Error loading profile: {profileState.error.message}
      </div>
    );

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
          papers: totalPapers,
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
