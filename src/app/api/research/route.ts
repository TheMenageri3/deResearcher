import { ResearchPaperModel } from "@/app/models";
import connectToDatabase from "@/lib/mongoServer";
import { NextRequest, NextResponse } from "next/server";
import { ResearchPaperType } from "../types";
import { toErrResponse, toSuccessResponse } from "../helpers";

// get papers by researcherPubkey/paperPubkey/researchPaperstate
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const searchParams = req.nextUrl.searchParams;
    const paperPubkey = searchParams.get("paperPubkey");
    const researcherPubkey = searchParams.get("researcherPubkey");
    const researchPaperstate = searchParams.get("researchPaperstate");

    console.log("Received parameters:", {
      paperPubkey,
      researcherPubkey,
      researchPaperstate,
    });

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
      // Remove the enum check and directly use the state
      query.state = researchPaperstate;
    }

    console.log("Constructed query:", query);

    // Fetch papers based on the constructed query
    const papers = await ResearchPaperModel.find<ResearchPaperType>(
      query,
    ).lean();

    console.log(`Found ${papers.length} papers`);
    if (papers.length > 0) {
      console.log("Sample paper state:", papers[0].state);
    }

    return toSuccessResponse(papers);
  } catch (error: any) {
    console.error("Error in GET /api/research:", error);
    return toErrResponse("Error fetching Research Papers");
  }
}
