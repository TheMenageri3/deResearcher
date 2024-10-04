import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import {
  ResearchPaperModel,
  ResearcherProfileModel,
  PeerReviewModel,
} from "@/app/models";

export async function GET(
  req: NextRequest,
  { params }: { params: { state: string; paper_id: string } },
): Promise<NextResponse> {
  try {
    const { state, paper_id } = params;
    console.log(`Fetching paper with ID: ${paper_id} and state: ${state}`);

    if (!ObjectId.isValid(paper_id)) {
      console.log("Invalid ObjectId:", paper_id);
      return NextResponse.json({ error: "Invalid Paper ID" }, { status: 400 });
    }

    const objectId = new ObjectId(paper_id);
    const paper = await ResearchPaperModel.findOne({ _id: objectId, state })
      .populate({
        path: "userId",
        model: ResearcherProfileModel,
        select: "id name researcherPubkey",
      })
      .populate({
        path: "peerReviews",
        model: PeerReviewModel,
        select:
          "id reviewerId qualityOfResearch potentialForRealWorldUseCase domainKnowledge practicalityOfResultObtained metadata createdAt updatedAt",
        populate: {
          path: "reviewerId",
          model: ResearcherProfileModel,
          select: "researcherPubkey name",
        },
      })

      .lean();

    if (!paper) {
      console.log("Paper not found with ID:", paper_id);
      return NextResponse.json({ error: "Paper not found" }, { status: 404 });
    }

    return NextResponse.json(paper);
  } catch (error) {
    console.error("Error fetching paper:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
