"use client";

import { useEffect, useState, useCallback } from "react";
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
  const { isAuthenticated, wallet, checkAuth, isLoading } = useUserStore();
  const [localAuthState, setLocalAuthState] = useState(initialAuthState);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const performAuthCheck = useCallback(async () => {
    if (!hasCheckedAuth) {
      await checkAuth();
      setHasCheckedAuth(true);
    }
  }, [checkAuth, hasCheckedAuth]);

  useEffect(() => {
    performAuthCheck();
  }, [performAuthCheck]);

  useEffect(() => {
    if (hasCheckedAuth) {
      console.log("Updating local auth state", { isAuthenticated, wallet });
      setLocalAuthState({ isAuthenticated, wallet });
    }
  }, [isAuthenticated, wallet, hasCheckedAuth]);

  console.log("Current state:", { isLoading, hasCheckedAuth, localAuthState });

  const latestPeerReviewingPapers = papers
    .filter((paper) => paper.status === PAPER_STATUS.PEER_REVIEWING)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5)
    .map((paper) => ({
      id: paper.id,
      title: paper.title,
      authors: paper.authors.join(", "),
      createdDate: new Date(paper.created_at).toISOString().split("T")[0],
      domains: paper.domains.join(", "),
      status: paper.status,
    }));

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
          No peer-reviewing papers found. Create a new paper to get started.
        </P>
      ) : (
        <Table columns={COLUMNS} data={latestPeerReviewingPapers} />
      )}
    </main>
  );
}

// Fake data
const CardContent = [
  {
    title: "Complete your profile ⚡",
    description:
      "Ensure your profile is up to date to maximize visibility and enhance collaboration opportunities.",
    buttonText: "Complete Profile",
    path: "/dashboard/profile",
  },
  {
    title: "Upload your paper 🦒",
    description:
      "Contribute to the community by sharing your research and gaining valuable peer feedback.",
    buttonText: "Upload Paper",
    path: "/dashboard/papers/create",
  },
];