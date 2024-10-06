import {
  ResearchPaperModel,
  ResearcherProfileModel,
  PeerReviewModel,
} from "@/app/models";
import connectToDatabase from "@/lib/mongoServer";
import { NextRequest, NextResponse } from "next/server";
import { ResearchPaperType } from "../types";

// get papers by userId/state/id
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const paperId = req.nextUrl.searchParams.get("id");
    const userId = req.nextUrl.searchParams.get("userId");
    const state = req.nextUrl.searchParams.get("state");

    let query: any = {};

    if (paperId) {
      query._id = paperId;
    }

    if (userId) {
      query.userId = userId;
    }

    if (state) {
      query.state = state;
    }

    console.log(query);

    // Fetch papers based on the constructed query
    const papers = await ResearchPaperModel.find<ResearchPaperType>(query)
      .populate({
        path: "userId",
        model: ResearcherProfileModel,
        select: "id name researcherPubkey",
      })
      .populate({
        path: "peerReviews",
        model: PeerReviewModel,
        select:
          "id reviewerId qualityOfResearch potentialForRealWorldUseCase domainKnowledge practicalityOfResultObtained metadata",
        populate: {
          path: "reviewerId",
          model: ResearcherProfileModel,
          select: "id name researcherPubkey",
        },
      })
      .exec();

    if (!papers || papers.length === 0) {
      return NextResponse.json({ error: "No papers found" }, { status: 404 });
    }

    return NextResponse.json(papers, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET /api/research-papers:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
