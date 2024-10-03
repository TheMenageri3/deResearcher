import { NextRequest, NextResponse } from "next/server";
import { toErrResponse, toSuccessResponse } from "../helpers";
import {
  ResearchMintCollection,
  ResearchMintCollectionModel,
} from "@/app/models";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = req.nextUrl.searchParams;

    const readerPubkey = searchParams.get("readerPubkey");

    if (!readerPubkey) {
      return toErrResponse("readerPubkey is required");
    }

    const researchMintCollection =
      await ResearchMintCollectionModel.findOne<ResearchMintCollection>({
        readerPubkey,
      });

    if (!researchMintCollection) {
      return toErrResponse("Research Mints Collection not found");
    }

    return toSuccessResponse(researchMintCollection);
  } catch (err) {
    return toErrResponse("Error fetching Research Mint Collection");
  }
}
