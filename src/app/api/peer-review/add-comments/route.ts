import { NextRequest, NextResponse } from "next/server";

import connectToDatabase from "@/lib/mongoServer";
import {
  PeerReviewModel,
  ResearcherProfileModel,
  ResearchPaperModel,
} from "@/app/models";
import { toErrResponse, toSuccessResponse } from "../../helpers";
import { AddPeerReviewCommentsSchema, PeerReviewType } from "../../types";

export async function POST(req: NextRequest): Promise<NextResponse> {
  await connectToDatabase();

  try {
    const unsafeData = await req.json();

    const data = AddPeerReviewCommentsSchema.parse(unsafeData);

    const existingPeerReview = await PeerReviewModel.findOne<PeerReviewType>({
      address: data.address,
    });

    if (!existingPeerReview) {
      return toErrResponse("Peer Review not found");
    }
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
      },
    );

    return toSuccessResponse(existingPeerReview);
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
      toErrResponse(
        "Error in validation : " + JSON.stringify(validationErrors),
      );
    }

    return toErrResponse("Error creating Peer Review");
  }
}
