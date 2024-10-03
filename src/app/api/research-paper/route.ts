import { NextRequest, NextResponse } from "next/server";
import { toErrResponse, toSuccessResponse } from "../helpers";
import {
  ResearchPaperModel,
  ResearcherProfileModel,
  PeerReviewModel,
} from "@/app/models"; // Import models from index

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = req.nextUrl.searchParams;

    const paperId = searchParams.get("id");
    const userId = searchParams.get("userId");
    const state = searchParams.get("state");
    const paperPubkey = searchParams.get("paperPubkey");
    const creatorPubkey = searchParams.get("creatorPubkey");

    let query: any = {};
    if (paperId) query._id = paperId;
    if (userId) query.userId = userId;
    if (state) query.state = state;
    if (paperPubkey) query.address = paperPubkey;
    if (creatorPubkey) query.creatorPubkey = creatorPubkey;

    console.log(query);

    const papers = await ResearchPaperModel.find(query)
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
      return toErrResponse("No papers found");
    }

    return toSuccessResponse(papers);
  } catch (error: any) {
    console.error("Error in GET /api/research-papers:", error);
    return toErrResponse("Internal Server Error");
  }
}

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();

    const user = await ResearcherProfileModel.findById(reqBody.userId); // Import from index
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create the paper object to store in the database
    const newPaper = await ResearchPaperModel.create(reqBody);

    // Manually update the user's papers array (also atomic)
    await ResearcherProfileModel.findByIdAndUpdate(
      reqBody.userId,
      { $addToSet: { papers: newPaper._id } },
      { new: true },
    );

    console.log(newPaper);
    return NextResponse.json(newPaper, { status: 201 });
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
    console.error("Error creating paper:", error);
    return toErrResponse("Error fetching research papers");
  }
}
