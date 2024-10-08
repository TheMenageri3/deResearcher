import { NextRequest, NextResponse } from "next/server";
import { toErrResponse, toSuccessResponse } from "../helpers";
import {
  ResearchMintCollection,
  ResearchMintCollectionModel,
  ResearchPaperModel,
} from "@/app/models";

import {
  PushToResearchMintCollectionSchema,
  ResearchMintCollectionType,
  ResearchPaperType,
} from "../types";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = req.nextUrl.searchParams;
    const researcherPubkey = searchParams.get("researcherPubkey");
    const paperPubkey = searchParams.get("paperPubkey");

    if (!researcherPubkey) {
      return toErrResponse("researcherPubkey is required");
    }

    if (!paperPubkey) {
      return toErrResponse("paperPubkey is required");
    }

    const researchMintCollection = await ResearchMintCollectionModel.findOne({
      readerPubkey: researcherPubkey,
      "metadata.mintedResearchPaperPubkeys": paperPubkey,
    });

    if (!researchMintCollection) {
      return toSuccessResponse({ isMinter: false });
    }

    return toSuccessResponse({ isMinter: true });
  } catch (err) {
    console.error("Error checking minter status:", err);
    return toErrResponse("Error checking minter status");
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const unsafeData = await req.json();

    const data = PushToResearchMintCollectionSchema.parse(unsafeData);

    const existing =
      await ResearchMintCollectionModel.findOne<ResearchMintCollectionType>({
        readerPubkey: data.readerPubkey,
        address: data.address,
      });

    const researchPaper = await ResearchPaperModel.findById<ResearchPaperType>(
      data.newMintedResearchPaperPubkey,
    );

    if (!researchPaper) {
      return toErrResponse("Research Paper not found");
    }

    if (existing) {
      ResearchMintCollectionModel.updateOne<ResearchMintCollectionType>(
        { readerPubkey: data.readerPubkey, address: data.address },
        {
          $set: {
            metaDataMerkleRoot: data.metaDataMerkleRoot,
          },
          $addToSet: {
            "metadata.mintedResearchPaperPubkeys": researchPaper.address,
          },
        },
      );

      return toSuccessResponse({
        data: existing,
        message: "Research Paper added to Research Mint Collection",
      });
    } else {
      let newResearchMintCollection: ResearchMintCollectionType = {
        readerPubkey: data.readerPubkey,
        address: data.address,
        metadata: {
          mintedResearchPaperPubkeys: [researchPaper.address],
        },
        metaDataMerkleRoot: data.metaDataMerkleRoot,
        bump: data.bump,
      };

      newResearchMintCollection = await ResearchMintCollectionModel.create(
        newResearchMintCollection,
      );

      return toSuccessResponse({
        data: newResearchMintCollection,
        message: "Research Paper added to Research Mint Collection",
      });
    }
  } catch (err) {
    return toErrResponse("Error creating Research Mint Collection");
  }
}
