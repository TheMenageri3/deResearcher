import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { ResearchMintCollectionModel, ResearchPaperModel } from "@/app/models";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { readerPubkey, metadata, dataMerkleRoot, bump } = body;

    // Validate presence of all required fields
    if (
      !readerPubkey ||
      !metadata?.mintedResearchPaperIds ||
      dataMerkleRoot === undefined ||
      bump === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: readerPubkey, metadata.mintedResearchPaperIds, dataMerkleRoot, bump",
        },
        { status: 400 },
      );
    }

    // Validate that readerPubkey is a non-empty string
    if (typeof readerPubkey !== "string" || readerPubkey.trim() === "") {
      return NextResponse.json(
        { error: "Invalid reader public key" },
        { status: 400 },
      );
    }

    // Validate dataMerkleRoot is an array of exactly 64 numbers
    if (
      !Array.isArray(dataMerkleRoot) ||
      dataMerkleRoot.length !== 64 ||
      !dataMerkleRoot.every(
        (num) => typeof num === "number" && num >= 0 && num <= 255,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid dataMerkleRoot. It must be an array of exactly 64 bytes (numbers between 0 and 255).",
        },
        { status: 400 },
      );
    }

    // Validate bump is a number
    if (typeof bump !== "number") {
      return NextResponse.json(
        { error: "Invalid bump value. It must be a number." },
        { status: 400 },
      );
    }

    // Ensure mintedResearchPaperIds is an array
    const mintedResearchPaperIds = Array.isArray(
      metadata.mintedResearchPaperIds,
    )
      ? metadata.mintedResearchPaperIds
      : [metadata.mintedResearchPaperIds];

    // Validate each research paper ID
    for (const id of mintedResearchPaperIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { error: `Invalid research paper ID: ${id}` },
          { status: 400 },
        );
      }
    }

    // Convert string IDs to ObjectIds
    const paperObjectIds = mintedResearchPaperIds.map(
      (id: string) => new mongoose.Types.ObjectId(id),
    );

    // Validate that all research papers exist
    const researchPapers = await ResearchPaperModel.find({
      _id: { $in: paperObjectIds },
    });

    if (researchPapers.length !== paperObjectIds.length) {
      return NextResponse.json(
        { error: "One or more research papers not found" },
        { status: 404 },
      );
    }

    // Fetch the ResearchMintCollection for the reader
    let mintCollection = await ResearchMintCollectionModel.findOne({
      readerPubkey,
    });

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (!mintCollection) {
        // If no mintCollection exists, create a new one
        mintCollection = new ResearchMintCollectionModel({
          readerPubkey,
          dataMerkleRoot,
          bump,
          metadata: {
            mintedResearchPaperIds: paperObjectIds,
          },
        });

        // Save the new mintCollection
        await mintCollection.save({ session });

        // Increment totalMint for each ResearchPaper
        await ResearchPaperModel.updateMany(
          { _id: { $in: paperObjectIds } },
          { $inc: { totalMints: 1 } },
          { session },
        );

        await session.commitTransaction();
        return NextResponse.json(
          { message: "Mint collection created and papers minted successfully" },
          { status: 201 },
        );
      } else {
        // If mintCollection exists, check for already minted papers
        const alreadyMintedIds =
          mintCollection.metadata.mintedResearchPaperIds.filter(
            (id: mongoose.Types.ObjectId) =>
              paperObjectIds.some((paperId: mongoose.Types.ObjectId) =>
                paperId.equals(id),
              ),
          );

        if (alreadyMintedIds.length > 0) {
          await session.abortTransaction();
          return NextResponse.json(
            { message: "One or more papers already minted by this reader" },
            { status: 200 },
          );
        }

        // Add new paperObjectIds to mintedResearchPaperIds
        mintCollection.metadata.mintedResearchPaperIds.push(...paperObjectIds);
        await mintCollection.save({ session });

        // Increment totalMint for each ResearchPaper
        await ResearchPaperModel.updateMany(
          { _id: { $in: paperObjectIds } },
          { $inc: { totalMints: 1 } },
          { session },
        );

        await session.commitTransaction();
        return NextResponse.json(
          { message: "Papers minted successfully" },
          { status: 200 },
        );
      }
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error: unknown) {
    console.error(
      "Error in mint route:",
      error instanceof Error ? error.stack : error,
    );
    return NextResponse.json({ error: "Internal server error" });
  }
}
