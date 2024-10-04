import { NextRequest, NextResponse } from "next/server";
import { toErrResponse, toSuccessResponse } from "../../helpers";
import {
  ResearchPaperModel,
  ResearcherProfileModel,
  PeerReviewModel,
} from "@/app/models";

export async function GET(
  req: NextRequest,
  { params }: { params: { state: string } },
): Promise<NextResponse> {
  try {
    const { state } = params;

    console.log(`Fetching papers with state: ${state}`); // Log state

    // Fetch all papers with the given state
    const papers = await ResearchPaperModel.find({ state })
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

    console.log(`Found ${papers.length} papers`);

    if (!papers || papers.length === 0) {
      return NextResponse.json(
        { error: `No papers found for state: ${state}` },
        { status: 404 },
      );
    }
    console.log(papers[0]);
    return NextResponse.json(papers, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching papers:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
