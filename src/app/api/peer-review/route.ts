import { NextRequest, NextResponse } from "next/server";

import connectToDatabase from "@/lib/mongoServer";
import {
  PeerReviewModel,
  ResearcherProfileModel,
  ResearchPaperModel,
} from "@/app/models";
import { toErrResponse, toSuccessResponse } from "../helpers";
import {
  AddPeerReviewSchema,
  PeerReviewType,
  ResearcherProfileType,
  ResearchPaperType,
} from "../types";

export async function POST(req: NextRequest): Promise<NextResponse> {
  await connectToDatabase();

  try {
    const unsafeData = await req.json();

    const data = AddPeerReviewSchema.parse(unsafeData);

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

    // Create the new PeerReview document
    const newPeerReview = await PeerReviewModel.create<PeerReviewType>(data);

    return toSuccessResponse(newPeerReview);
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

// get peer reviews by paperId/reviewerId
export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    // Extract query parameters
    const searchParams = req.nextUrl.searchParams;
    const reviewerPubkey = searchParams.get("reviewerPubkey");
    const paperPubkey = searchParams.get("paperPubkey");

    // Build query object
    let query: {
      [key: string]: string;
    } = {};

    if (paperPubkey) {
      query.paperPubkey = paperPubkey;
    }

    if (reviewerPubkey) {
      query.reviewerPubkey = reviewerPubkey;
    }

    // If no parameters are provided, return an error or all peer reviews
    if (Object.keys(query).length === 0) {
      toErrResponse("Please provide a paperPubkey or reviewerPubkey");
    }

    // Fetch peer reviews based on the query
    const peerReviews = await PeerReviewModel.find<PeerReviewType[]>(query);

    return toSuccessResponse(peerReviews);
  } catch (error: any) {
    console.log("Error in GET /api/peer-reviews:", error);
    toErrResponse("Error fetching peer reviews");
  }
}
