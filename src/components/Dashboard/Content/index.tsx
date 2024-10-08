"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useUserStore } from "@/app/store/userStore";
import DashboardCard from "@/components/Dashboard/Card";
import H3 from "@/components/H3";
import Table from "@/components/Dashboard/Table";
import { COLUMNS, PAPER_STATUS } from "@/lib/constants";
import papers from "@/dummyData/dummyPapers.json";
import P from "@/components/P";

interface DashboardContentProps {
  initialAuthState: {
    isAuthenticated: boolean;
    wallet: string | null;
  };
}

export default function DashboardContent({
  initialAuthState,
}: DashboardContentProps) {
  const { isAuthenticated, wallet, checkAuth, researcherProfile, isLoading } =
    useUserStore();
  const [localAuthState, setLocalAuthState] = useState(initialAuthState);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const performAuthCheck = useCallback(async () => {
    if (!hasCheckedAuth && wallet) {
      await checkAuth(wallet);
      setHasCheckedAuth(true);
    }
  }, [checkAuth, hasCheckedAuth, wallet]);

  useEffect(() => {
    performAuthCheck();
  }, [performAuthCheck]);

  useEffect(() => {
    if (hasCheckedAuth) {
      setLocalAuthState({ isAuthenticated, wallet });
    }
  }, [isAuthenticated, wallet, hasCheckedAuth]);

  const latestPeerReviewingPapers = papers
    .filter((paper) => paper.state === PAPER_STATUS.IN_PEER_REVIEW)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5)
    .map((paper) => ({
      id: paper.id,
      title: paper.metadata.title,
      authors: paper.metadata.authors,
      createdDate: new Date(paper.createdAt).toISOString().split("T")[0],
      domains: paper.domains,
      status: paper.state,
    }));

  // conditionally show cards based on researcher profile
  const CardContent = useMemo(() => {
    const cards = [
      {
        title: "Upload your paper 🦒",
        description:
          "Contribute to the community by sharing your research and gaining valuable peer feedback.",
        buttonText: "Upload Paper",
        path: "/dashboard/papers/create",
      },
    ];

    if (!researcherProfile) {
      cards.unshift({
        title: "Complete your profile ⚡",
        description: "Please complete your profile to create a paper",
        buttonText: "Complete Profile",
        path: "/dashboard/profile",
      });
    }

    return cards;
  }, [researcherProfile]);

  return (
    <main className="flex-1 overflow-x-hidden bg-zinc-100">
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CardContent.map((card, index) => (
          <DashboardCard
            key={index}
            title={card.title}
            description={card.description}
            buttonText={card.buttonText}
            path={card.path}
          />
        ))}
      </div>
      <H3 className="mt-8 text-center md:text-start text-zinc-700">
        Latest Peer Review Papers
      </H3>
      {latestPeerReviewingPapers.length === 0 ? (
        <P className="text-zinc-600 text-center pt-10">
          No peer-reviewing papers found. Upload a new paper to get started.
        </P>
      ) : (
        <Table columns={COLUMNS} data={latestPeerReviewingPapers} />
      )}
    </main>
  );
}
