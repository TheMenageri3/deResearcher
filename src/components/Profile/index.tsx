"use client";

import React, { useState, useRef, useEffect } from "react";
import { ProfileInfo } from "./ProfileInfo";
import { ProfileBanner } from "./ProfileBanner";
import { ProfileTabs } from "./ProfileTabs";
import Table from "@/components/Dashboard/Table";

import { minimizePubkey } from "@/lib/helpers";
import { PROFILE_COLUMNS } from "@/lib/constants";

import { useBackgroundImage } from "@/hooks/useBackgroundImage";

import { ResearcherProfileType } from "@/lib/types";

export default function ProfileComponent({ pubkey }: { pubkey: string }) {
  const [user, setUser] = useState<ResearcherProfileType | null>(null);
  const minimizedWalletAddress = minimizePubkey(pubkey);
  const [activeTab, setActiveTab] = useState("contributions");
  const {
    backgroundImage,
    isNewBackgroundImage,
    handleEditClick,
    handleSaveClick,
  } = useBackgroundImage();

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const prevActiveTabRef = useRef(activeTab);
  const [isLoading, setIsLoading] = useState(false);

  async function getProfile(pubkey: string): Promise<ResearcherProfileType> {
    const response = await fetch(
      `/api/researcher-profile?researcherPubkey=${pubkey}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    return result;
  }

  useEffect(() => {
    async function fetchProfile() {
      try {
        setIsLoading(true);
        const profile = await getProfile(pubkey);
        console.log("Fetched profile:", profile);
        setUser(profile);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [pubkey]);

  useEffect(() => {
    if (prevActiveTabRef.current !== activeTab && tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
    prevActiveTabRef.current = activeTab;
  }, [activeTab]);

  return (
    <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 mb-20">
      {isLoading ? (
        <div className="flex justify-center items-start pt-8">
          <svg
            className="animate-spin h-8 w-8 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      ) : (
        <>
          <ProfileBanner
            avatarSrc={user?.metadata?.profileImageURI || "/avatar.png"}
            onEditClick={handleEditClick}
            onSaveClick={handleSaveClick}
            isVerified={true}
            backgroundImage={backgroundImage}
            isNewBackgroundImage={isNewBackgroundImage}
          />

          <ProfileInfo
            name={user?.name || ""}
            organization={user?.metadata?.organization || ""}
            walletAddress={minimizedWalletAddress}
            fullWalletAddress={pubkey}
            socialLink={user?.metadata?.socialLinks?.[0] || ""}
            bio={user?.metadata?.bio || ""}
            stats={{
              papers: user?.totalPapersPublished || 0,
              reviewedPapers: user?.totalReviews || 0,
              reputation: user?.reputation || 0,
            }}
          />

          <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          <div
            ref={tableContainerRef}
            className="h-[calc(100vh-400px)] overflow-y-auto"
          >
            <Table columns={PROFILE_COLUMNS} data={[]} />
          </div>
        </>
      )}
    </div>
  );
}
