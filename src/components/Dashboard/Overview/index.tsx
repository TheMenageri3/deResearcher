import H3 from "@/components/H3";
import Table from "../Table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import users from "../../../dummyData/dummyUser.json";
import { COLUMNS } from "@/lib/utils/constants";
import H4 from "@/components/H4";

export default function OverviewComponent() {
  const userPapers =
    users[0]?.papers?.map((paper) => ({
      id: paper.id,
      title: paper.title,
      authors: paper.authors.join(", "),
      createdDate: new Date(paper.created_at).toISOString().split("T")[0],
      domain: paper.domain.join(", "),
      status: paper.status,
    })) || [];

  return (
    <>
      <div className="flex justify-end md:justify-between items-center mb-6">
        <H3 className="hidden md:block">Overview</H3>
        <Link href="/dashboard/papers/create">
          <Button className="text-white text-sm">Create new paper</Button>
        </Link>
      </div>
      <div className="flex flex-col">
        {userPapers.length === 0 && (
          <H4 className="text-zinc-600 text-center pt-10">
            No papers found. Create a new one ⚡
          </H4>
        )}
        {userPapers.length > 0 && (
          <Table columns={COLUMNS} data={userPapers} marginTop="mt-4" />
        )}
      </div>
    </>
  );
}
