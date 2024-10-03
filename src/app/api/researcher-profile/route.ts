import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoServer";
import {
  PeerReviewModel,
  ResearcherProfileModel,
  ResearchPaperModel,
} from "@/app/models";

// create a new profile
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const reqBody = await req.json();
    const profile = await ResearcherProfileModel.create(reqBody);
    return NextResponse.json(profile, { status: 201 });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      const validationErrors = Object.entries(error.errors).map(
        ([field, err]: [string, any]) => ({
          field,
          message: err.message,
          value: err.value,
        }),
      );
      return NextResponse.json(
        { error: "Validation Error", details: validationErrors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 },
    );
  }
}

// get papers by userId
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const userId = req.nextUrl.searchParams.get("id");
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const user = await ResearcherProfileModel.findById(userId)
      .populate({
        path: "papers",
        model: ResearchPaperModel,
        select:
          "id state accessFee version minters metadata.title metadata.abstract metadata.authors createdAt tags peerReviews",
        populate: {
          path: "peerReviews",
          model: PeerReviewModel,
          select:
            "id reviewerId qualityOfResearch potentialForRealWorldUseCase domainKnowledge practicalityOfResultObtained metadata",
        },
      })
      .populate({
        path: "peerReviewsAsReviewer",
        model: PeerReviewModel,
        select:
          "id paperId qualityOfResearch potentialForRealWorldUseCase domainKnowledge practicalityOfResultObtained metadata",
        populate: {
          path: "paperId",
          model: ResearchPaperModel,
          select: "id metadata.title",
        },
      });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET /api/researcher-profiles:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 },
    );
  }
}
