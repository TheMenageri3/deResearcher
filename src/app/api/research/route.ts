import { ResearcherProfileModel, ResearchPaperModel } from "@/app/models";
import connectToDatabase from "@/lib/mongoServer";
import { NextRequest, NextResponse } from "next/server";
import { ResearchPaperType } from "../types";
import { toErrResponse, toSuccessResponse } from "../helpers";
import {
  ResearcherProfileType,
  ResearchPaperWithResearcherProfile,
} from "@/lib/types";

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

    // Fetch papers based on the constructed query
    const papers = await ResearchPaperModel.find<ResearchPaperType>(query);

    const paperWithResearcherProfiles: ResearchPaperWithResearcherProfile[] =
      [];

    for (const paper of papers) {
      const researcherProfile =
        await ResearcherProfileModel.findOne<ResearcherProfileType>({
          researcherPubkey: paper.creatorPubkey,
        });

      if (researcherProfile) {
        paperWithResearcherProfiles.push({
          researchPaper: paper,
          researcherProfile,
        });
      }
    }

    return toSuccessResponse(paperWithResearcherProfiles);
  } catch (error: any) {
    console.error("Error in GET /api/research:", error);
    return toErrResponse("Error fetching Research Papers");
  }
}
