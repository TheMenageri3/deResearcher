import { NextRequest, NextResponse } from "next/server";

import connectToDatabase from "@/lib/mongoServer";
import {
  PeerReviewModel,
  ResearcherProfileModel,
  ResearchPaperModel,
} from "@/app/models";
import { CreateResearchPaperSchema, ResearchPaperType } from "../types";

// create a new paper
export async function POST(req: NextRequest) {
  await connectToDatabase();
  let unsafeData = await req.json();

  const data = CreateResearchPaperSchema.parse(unsafeData);

  try {
    // Validate that the creator exists
    const creator = await ResearcherProfileModel.findById(data.creatorPubkey);
    if (!creator) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const researchPaper: ResearchPaperType = {
      address: data.address,
      creatorPubkey: data.creatorPubkey,
      creatorId: creator._id,
      state: "AwaitingPeerReview",
      totalApprovals: 0,
      totalCitations: 0,
      totalMints: 0,
      peerReviews: [],
      paperContentHash: data.paperContentHash,
      accessFee: data.accessFee,
      version: 0,
      metaDataMerkleRoot: data.metaDataMerkleRoot,
      metadata: data.metadata,
      bump: data.bump,
    };

    // Create the new paper (this is an atomic operation)
    const paper = await ResearchPaperModel.create(researchPaper);

    // Manually update the user's papers array (also atomic)
    await ResearcherProfileModel.findByIdAndUpdate(
      creator._id,
      { $addToSet: { papers: paper._id } },
      { new: true }
    );

    return NextResponse.json(paper, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/research-papers:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.entries(error.errors).map(
        ([field, err]: [string, any]) => ({
          field,
          message: err.message,
          value: err.value,
        })
      );
      return NextResponse.json(
        { error: "Validation Error", details: validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}

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
