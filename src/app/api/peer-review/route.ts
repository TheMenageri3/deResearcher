import { NextRequest, NextResponse } from "next/server";

import connectToDatabase from "@/lib/mongoServer";
import {
  PeerReviewModel,
  ResearcherProfileModel,
  ResearchPaperModel,
} from "@/app/models";

export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const reqBody = await req.json();

    // Extract data from request body
    const {
      reviewerId,
      paperId,
      address,
      reviewerPubkey,
      paperPubkey,
      qualityOfResearch,
      potentialForRealWorldUseCase,
      domainKnowledge,
      practicalityOfResultObtained,
      metaDataMerkleRoot,
      metadata,
      bump,
    } = reqBody;

    // Validate required fields
    if (
      !reviewerId ||
      !paperId ||
      !address ||
      !reviewerPubkey ||
      !paperPubkey ||
      !qualityOfResearch ||
      !potentialForRealWorldUseCase ||
      !domainKnowledge ||
      !practicalityOfResultObtained ||
      !metaDataMerkleRoot ||
      !metadata ||
      !bump
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate that the reviewer exists
    const reviewer = await ResearcherProfileModel.findById(reviewerId);
    if (!reviewer) {
      return NextResponse.json(
        { error: "Reviewer not found" },
        { status: 404 },
      );
    }

    // Validate that the paper exists
    const paper = await ResearchPaperModel.findById(paperId);
    if (!paper) {
      return NextResponse.json({ error: "Paper not found" }, { status: 404 });
    }

    // Create the new PeerReview document
    const newPeerReview = await PeerReviewModel.create({
      reviewerId,
      paperId,
      address,
      reviewerPubkey,
      paperPubkey,
      qualityOfResearch,
      potentialForRealWorldUseCase,
      domainKnowledge,
      practicalityOfResultObtained,
      metaDataMerkleRoot,
      metadata,
      bump,
    });

    // Update the ResearchPaper document
    await ResearchPaperModel.findByIdAndUpdate(
      paperId,
      { $addToSet: { peerReviews: newPeerReview._id } },
      { new: true },
    );

    // Update the ResearcherProfile document
    await ResearcherProfileModel.findByIdAndUpdate(
      reviewerId,
      { $addToSet: { peerReviewsAsReviewer: newPeerReview._id } },
      { new: true },
    );

    return NextResponse.json(newPeerReview, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/peer-reviews:", error);

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

// get peer reviews by paperId/reviewerId
export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    // Extract query parameters
    const paperId = req.nextUrl.searchParams.get("paperId");
    const reviewerId = req.nextUrl.searchParams.get("reviewerId");

    // Build query object
    let query: any = {};

    if (paperId) {
      query.paperId = paperId;
    }

    if (reviewerId) {
      query.reviewerId = reviewerId;
    }

    // If no parameters are provided, return an error or all peer reviews
    if (Object.keys(query).length === 0) {
      return NextResponse.json(
        {
          error:
            "Please provide at least one query parameter (paperId or reviewerId)",
        },
        { status: 400 },
      );
    }

    // Fetch peer reviews based on the query
    const peerReviews = await PeerReviewModel.find(query)
      .populate({
        path: "reviewerId",
        model: ResearcherProfileModel,
        select: "id name researcherPubkey",
      })
      .populate({
        path: "paperId",
        model: ResearchPaperModel,
        select: "id title",
      })
      .exec();

    if (!peerReviews || peerReviews.length === 0) {
      return NextResponse.json(
        { error: "No peer reviews found" },
        { status: 404 },
      );
    }

    return NextResponse.json(peerReviews, { status: 200 });
  } catch (error: any) {
    console.error("Error in GET /api/peer-reviews:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 },
    );
  }
}
