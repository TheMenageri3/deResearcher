import { NextRequest, NextResponse } from "next/server";

import connectToDatabase from "@/lib/mongoServer";
import {
  PeerReviewModel,
  ResearcherProfileModel,
  ResearchPaperModel,
} from "@/app/models";
import { toErrResponse, toSuccessResponse } from "../../helpers";
import {
  AddPeerReviewCommentsSchema,
  PeerReviewType,
  ResearcherProfileType,
  ResearchPaperType,
} from "../../types";

export async function POST(req: NextRequest): Promise<NextResponse> {
  await connectToDatabase();

  try {
    const unsafeData = await req.json();

    const data = AddPeerReviewCommentsSchema.parse(unsafeData);

    // Validate that the reviewer exists
    const reviewer =
      await ResearcherProfileModel.findOne<ResearcherProfileType>({
        researcherPubkey: data.reviewerPubkey,
      });

    if (!reviewer) {
      return toErrResponse("Reviewer not found");
    }

    // Validate that the paper exists
    const paper = await ResearchPaperModel.findOne<ResearchPaperType>({
      paperPubkey: data.paperPubkey,
    });

    if (!paper) {
      return toErrResponse("Paper not found");
    }

    const existingPeerReview = await PeerReviewModel.findOne<PeerReviewType>({
      address: data.address,
    });

    if (existingPeerReview) {
      await PeerReviewModel.updateOne<PeerReviewType>(
        {
          address: data.address,
        },
        {
          $set: {
            metadata: {
              title: data.title,
              reviewComments: data.reviewComments,
            },
          },
        }
      );

      return toSuccessResponse(existingPeerReview);
    } else {
      const newPeerReview = await PeerReviewModel.create<PeerReviewType>({
        address: data.address,
        reviewerPubkey: data.reviewerPubkey,
        paperPubkey: data.paperPubkey,
        qualityOfResearch: 0,
        potentialForRealWorldUseCase: 0,
        domainKnowledge: 0,
        practicalityOfResultObtained: 0,
        metaDataMerkleRoot: data.metaDataMerkleRoot,
        metadata: {
          title: data.title,
          reviewComments: data.reviewComments,
        },
        bump: data.bump,
      });

      return toSuccessResponse(newPeerReview);
    }
  } catch (error: any) {
    console.error("Error in POST /api/peer-reviews:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.entries(error.errors).map(
        ([field, err]: [string, any]) => ({
          field,
          message: err.message,
          value: err.value,
        })
      );
      toErrResponse(
        "Error in validation : " + JSON.stringify(validationErrors)
      );
    }

    return toErrResponse("Error creating Peer Review");
  }
}
