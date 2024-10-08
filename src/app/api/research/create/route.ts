import { NextRequest, NextResponse } from "next/server";

import connectToDatabase from "@/lib/mongoServer";
import { ResearcherProfileModel, ResearchPaperModel } from "@/app/models";
import { CreateResearchPaperSchema, ResearchPaperType } from "../../types";
import { toErrResponse, toSuccessResponse } from "../../helpers";

// create a new paper
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectToDatabase();
    let unsafeData = await req.json();

    const data = CreateResearchPaperSchema.parse(unsafeData);
    // Validate that the creator exists
    const creatorResearchProfile = await ResearcherProfileModel.findOne({
      researcherPubkey: data.creatorPubkey,
    });
    if (!creatorResearchProfile) {
      return toErrResponse("ResearcherProfile not found for creator");
    }

    const researchPaper: ResearchPaperType = {
      address: data.address,
      creatorPubkey: data.creatorPubkey,
      state: "AwaitingPeerReview",
      totalApprovals: 0,
      totalCitations: 0,
      totalMints: 0,
      paperContentHash: data.paperContentHash,
      accessFee: data.accessFee,
      version: 0,
      metaDataMerkleRoot: data.metaDataMerkleRoot,
      metadata: data.metadata,
      bump: data.bump,
    };

    // Create the new paper (this is an atomic operation)
    const paper = await ResearchPaperModel.create(researchPaper);

    return toSuccessResponse(paper);
  } catch (error: any) {
    console.error("Error in POST /api/research-paper/create:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.entries(error.errors).map(
        ([field, err]: [string, any]) => ({
          field,
          message: err.message,
          value: err.value,
        })
      );
      return toErrResponse(
        "Error in validation : " + JSON.stringify(validationErrors)
      );
    }

    return toErrResponse("Error creating Research Paper");
  }
}
