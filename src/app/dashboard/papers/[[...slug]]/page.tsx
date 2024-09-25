import OverviewComponent from "@/components/Dashboard/Overview";
import MintedComponent from "@/components/Dashboard/Minted";
import P from "@/components/P";
import { PAPER_STATUS } from "@/lib/constants";

export default function DashboardPapers({
  params,
}: {
  params: { slug: string[] };
}) {
  if (params.slug[0] === PAPER_STATUS.MINTED) {
    return <MintedComponent />;
  }

  return <OverviewComponent />;
}
