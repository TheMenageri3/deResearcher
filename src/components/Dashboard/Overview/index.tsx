"use client";
import React, { useEffect, useState } from "react";
import H3 from "@/components/H3";
import Table from "../Table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { COLUMNS } from "@/lib/constants";
import H4 from "@/components/H4";
import { useUserStore } from "@/app/store/userStore";
import { usePaperStore } from "@/app/store/paperStore";

async function fetchPapers(pubkey: string) {
  const response = await fetch(`/api/research?researcherPubkey=${pubkey}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch papers: ${response.statusText}`);
  }
  return response.json();
}

const transformPaperData = (paper: any) => {
  let createdDate = "N/A";
  if (paper.createdAt) {
    if (paper.createdAt.$date) {
      // MongoDB format
      createdDate = new Date(paper.createdAt.$date).toISOString().split("T")[0];
    } else if (typeof paper.createdAt === "string") {
      createdDate = paper.createdAt.split("T")[0];
    } else if (typeof paper.createdAt === "number") {
      createdDate = new Date(paper.createdAt).toISOString().split("T")[0];
    }
  }

  return {
    id: paper._id,
    address: paper.address,
    title: paper.metadata?.title || "Untitled",
    authors: Array.isArray(paper.metadata?.authors)
      ? paper.metadata.authors.join(", ")
      : "Unknown",
    createdDate,
    domains: Array.isArray(paper.metadata?.tags)
      ? paper.metadata.tags.join(", ")
      : "N/A",
    status: paper.state || "Unknown",
    minted: paper.totalMints || 0,
  };
};

export default function OverviewComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const wallet = useUserStore((state) => state.wallet);
  const [allPapers, setAllPapers] = useState([]);

  useEffect(() => {
    if (wallet) {
      setIsLoading(true);
      fetchPapers(wallet.toString())
        .then((papers) => {
          const transformedPapers = papers.map(transformPaperData);
          setAllPapers(transformedPapers);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching papers:", error);
          setIsLoading(false);
        });
    }
  }, [wallet]);

  console.log("allPapers", allPapers);

  return (
    <>
      <div className="flex justify-end md:justify-between items-center mb-6">
        <H3 className="hidden md:block">Overview</H3>
        <Link href="/dashboard/papers/create">
          <Button className="text-white text-sm">Create new paper</Button>
        </Link>
      </div>
      <div className="flex flex-col">
        {isLoading ? (
          <H4 className="text-zinc-600 text-center pt-10">Loading...</H4>
        ) : allPapers.length === 0 ? (
          <H4 className="text-zinc-600 text-center pt-10">
            No papers found. Create a new one ⚡
          </H4>
        ) : (
          <Table columns={COLUMNS} data={allPapers} marginTop="mt-4" />
        )}
      </div>
    </>
  );
}
