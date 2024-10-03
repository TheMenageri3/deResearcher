import { PeerReviewModel, PeerReview } from "@/app/models"; // Import from centralized models index
import { NextRequest, NextResponse } from "next/server";
import { toErrResponse, toSuccessResponse } from "../helpers";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = req.nextUrl.searchParams;

    const address = searchParams.get("address");
    const reviewerPubkey = searchParams.get("reviewerPubkey");
    const paperPubkey = searchParams.get("paperPubkey");

    let findFilters = {};
    if (address) {
      findFilters = { ...findFilters, address };
    }
    if (reviewerPubkey) {
      findFilters = { ...findFilters, reviewerPubkey };
    }
    if (paperPubkey) {
      findFilters = { ...findFilters, paperPubkey };
    }

    const peerReviews = await PeerReviewModel.find<PeerReview>(findFilters);

    return toSuccessResponse(peerReviews);
  } catch (err) {
    return toErrResponse("Error fetching peer reviews");
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const data: PeerReview = await req.json();

    const existingPeerReview = await PeerReviewModel.findOne({
      address: data.address,
    });

    if (existingPeerReview) {
      return toErrResponse("Peer review already exists");
    }

    const peerReview = await PeerReviewModel.create(data);

    return toSuccessResponse(peerReview);
  } catch (err) {
    return toErrResponse("Error creating peer review");
  }
}
