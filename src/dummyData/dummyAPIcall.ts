import { Paper } from "@/lib/validation";
import papers from "./dummyPapers.json";

export async function getPapers(status: string): Promise<Paper[]> {
  return (papers as Paper[]).filter((paper) => paper.status === status);
}
