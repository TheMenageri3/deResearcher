"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { ProfileInfo } from "./ProfileInfo";
import { ProfileBanner } from "./ProfileBanner";
import { ProfileTabs } from "./ProfileTabs";
import Table from "@/components/Dashboard/Table";

import { Paper } from "@/lib/validation";
import { formatPaper, minimizePubkey } from "@/lib/helpers";
import { PROFILE_COLUMNS } from "@/lib/constants";

import { useBackgroundImage } from "@/hooks/useBackgroundImage";

import dummyUser from "@/dummyData/dummyUser.json";
import dummyPapers from "@/dummyData/dummyPapers.json";

export default function ProfileComponent() {
  const fullWalletAddress = dummyUser[0].wallets[0];
  const minimizedWalletAddress = minimizePubkey(fullWalletAddress);
  const [activeTab, setActiveTab] = useState("contributions");
  const {
    backgroundImage,
    isNewBackgroundImage,
    handleEditClick,
    handleSaveClick,
  } = useBackgroundImage();

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const prevActiveTabRef = useRef(activeTab);

  // TODO: Implement API calls to get data
  const data = useMemo(() => {
    const filterAndFormatPapers = (papers: Paper[], paperIds: string[]) =>
      papers.filter((paper) => paperIds.includes(paper.id)).map(formatPaper);

    switch (activeTab) {
      case "contributions":
        return dummyUser[0].papers.map(formatPaper);
      case "peer-reviews":
        const reviewedPaperIds = dummyUser[0].paper_reviews.map(
          (review) => review.paperId,
        );
        return filterAndFormatPapers(dummyPapers as Paper[], reviewedPaperIds);
      case "paid-reads":
        const mintedPaperIds = dummyUser[0].minted_papers.map(
          (paper) => paper.paper_id,
        );
        return filterAndFormatPapers(dummyPapers as Paper[], mintedPaperIds);
      default:
        return [];
    }
  }, [activeTab]);

  useEffect(() => {
    if (prevActiveTabRef.current !== activeTab && tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
    prevActiveTabRef.current = activeTab;
  }, [activeTab]);

  return (
    <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 mb-20">
      <ProfileBanner
        avatarSrc="https://plus.unsplash.com/premium_photo-1689977968861-9c91dbb16049?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        onEditClick={handleEditClick}
        onSaveClick={handleSaveClick}
        isVerified={true}
        backgroundImage={backgroundImage}
        isNewBackgroundImage={isNewBackgroundImage}
      />

      {/* Profile Information */}
      <ProfileInfo
        name={dummyUser[0].name}
        organization="🦒🦖TheMenageri3"
        walletAddress={minimizedWalletAddress}
        fullWalletAddress={fullWalletAddress}
        websiteUrl={dummyUser[0].website_url}
        socialLink={dummyUser[0].social_link}
        bio={dummyUser[0].bio}
        stats={{
          papers: dummyUser[0].papers.length,
          reviewedPapers: dummyUser[0].paper_reviews.length,
          reputation: 274,
        }}
      />

      <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Table Container to avoid jumping */}
      <div
        ref={tableContainerRef}
        className="h-[calc(100vh-400px)] overflow-y-auto"
      >
        <Table columns={PROFILE_COLUMNS} data={data} />
      </div>
    </div>
  );
}
