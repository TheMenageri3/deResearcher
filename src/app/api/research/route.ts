import { ResearchPaperModel } from "@/app/models";
import connectToDatabase from "@/lib/mongoServer";
import { NextRequest, NextResponse } from "next/server";
import { ResearchPaperType } from "../types";
import { toErrResponse, toSuccessResponse } from "../helpers";
import { PaperState } from "@/lib/validation";

// get papers by researcherPubkey/paperPubkey/researchPaperstate
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();

    const searchParams = req.nextUrl.searchParams;

    const paperPubkey = searchParams.get("paperPubkey");
    const researcherPubkey = searchParams.get("researcherPubkey");
    const researchPaperstate = searchParams.get("researchPaperstate");

    let query: {
      [key: string]: any;
    } = {};

    if (paperPubkey) {
      query.address = paperPubkey;
    }

    if (researcherPubkey) {
      query.creatorPubkey = researcherPubkey;
    }

    if (researchPaperstate) {
      if (Object.values(PaperState).includes(researchPaperstate)) {
        query.state = researchPaperstate;
      }
    }

    // Fetch papers based on the constructed query
    const papers = await ResearchPaperModel.find<ResearchPaperType>(query);

    return toSuccessResponse(papers);
  } catch (error: any) {
    console.error("Error in GET /api/research-papers:", error);
    return toErrResponse("Error fetching Research Papers");
  }
}
