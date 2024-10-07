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

    if (!researcherPubkey) {
      return toErrResponse("readerPubkey is required");
    }

    const researchMintCollection =
      await ResearchMintCollectionModel.findOne<ResearchMintCollection>({
        readerPubkey: researcherPubkey,
      });

    if (!researchMintCollection) {
      return toErrResponse("Research Mints Collection not found");
    }

    return toSuccessResponse(researchMintCollection);
  } catch (err) {
    return toErrResponse("Error fetching Research Mint Collection");
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
      data.newMintedResearchPaperPubkey
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
        }
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
        newResearchMintCollection
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
