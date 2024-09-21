import OverviewComponent from "@/components/Dashboard/Overview";
import MintedComponent from "@/components/Minted";
import P from "@/components/P";
import { PAPER_STATUS } from "@/lib/utils/constants";

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
