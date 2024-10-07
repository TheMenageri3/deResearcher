"use client";

import H3 from "@/components/H3";
import Table from "../Table";
import users from "../../../dummyData/dummyUser.json";
import { COLUMNS } from "@/lib/constants";
import H4 from "@/components/H4";
import P from "../../P";
import React from "react";

import { usePaperStore } from "@/app/store/paperStore";

export default function MintedComponent() {
  const { papers } = usePaperStore();

  // Create a new columns array based on COLUMNS, but replace the last item
  const mintedColumns = [
    ...COLUMNS.slice(0, -1),
    { key: "minted", header: "Minted Times", sortable: true },
  ];

  const mintedPapers =
    users[0]?.papers
      ?.filter((paper) => paper.minted.length > 0)
      ?.map((paper) => ({
        id: paper.id,
        title: paper.title,
        authors: paper.authors.join(", "),
        createdDate: new Date(paper.created_at).toISOString().split("T")[0],
        domains: paper.domains.join(", "),
        minted: paper.minted.length,
        status: paper.status,
      })) || [];

  return (
    <>
      <H3 className="font-semibold">Minted Papers</H3>
      <P className="text-sm text-zinc-700 pt-4 text-pretty leading-6">
        Minted papers are published research read by individuals who are paid in
        SOL. The more people who read your research, the more you can earn ⚡
      </P>
      <div className="flex flex-col">
        {mintedPapers.length === 0 && (
          <H4 className="text-zinc-600 text-center pt-10">
            No minted papers found. Create a new one to earn more ⚡
          </H4>
        )}
        {mintedPapers.length > 0 && (
          <Table columns={mintedColumns} data={mintedPapers} />
        )}
      </div>
    </>
  );
}
