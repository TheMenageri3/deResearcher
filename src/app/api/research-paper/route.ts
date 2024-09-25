import { NextRequest, NextResponse } from "next/server";
import ResearchPaperModel, {
  ResearchPaper,
} from "@/app/models/ResearchPaper.model";
import { toErrResponse, toSuccessResponse } from "../helpers";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = req.nextUrl.searchParams;

    const paperPubkey = searchParams.get("paperPubkey");

    const creatorPubkey = searchParams.get("creatorPubkey");

    let findFilters = {};

    if (paperPubkey) {
      findFilters = { ...findFilters, paperPubkey };
    }

    if (creatorPubkey) {
      findFilters = { ...findFilters, creatorPubkey };
    }

    const researchPapers = await ResearchPaperModel.find<ResearchPaper>(
      findFilters
    );

    return toSuccessResponse(researchPapers);
  } catch (err) {
    return toErrResponse("Error fetching research papers");
  }
}
