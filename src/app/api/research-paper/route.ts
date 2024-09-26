import { NextRequest, NextResponse } from "next/server";
import { toErrResponse, toSuccessResponse } from "../helpers";
import { PaperFormData } from "@/lib/validation";
import ResearchPaperModel, {
  ResearchPaper,
} from "@/app/models/ResearchPaper.model";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = req.nextUrl.searchParams;

    const paperPubkey = searchParams.get("paperPubkey");

    const creatorPubkey = searchParams.get("creatorPubkey");

    let findFilters = {};

    if (paperPubkey) {
      findFilters = { ...findFilters, paperPubkey };
    }

    if (creatorPubkey) {
      findFilters = { ...findFilters, creatorPubkey };
    }

    const researchPapers = await ResearchPaperModel.find<ResearchPaper>(
      findFilters,
    );

    return toSuccessResponse(researchPapers);
  } catch (err) {
    return toErrResponse("Error fetching research papers");
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();

    const paperData = PaperFormData.parse({
      title: formData.get("title"),
      authors: formData.get("authors"),
      description: formData.get("description"),
      domains: formData.get("domains"),
      paperImage: formData.get("paperImage"),
      paperFile: formData.get("paperFile"),
    });

    // Handle file uploads
    const paperFile = formData.get("paperFile") as File;
    const paperImage = formData.get("paperImage") as File;

    const placeholderHash = Array(64).fill(0);
    const currentDate = new Date().toISOString();

    const newPaper = new ResearchPaperModel({
      address: "placeholder_address",
      paperPubkey: "placeholder_pubkey",
      creatorPubkey: "placeholder_creator_pubkey",
      state: "AwaitingPeerReview",
      accessFee: 0,
      version: 1,
      paperContentHash: placeholderHash,
      totalApprovals: 0,
      totalCitations: 0,
      totalMints: 0,
      metaDataMerkleRoot: placeholderHash,
      metadata: {
        title: paperData.title,
        abstract: paperData.description,
        authors: paperData.authors.split(",").map((author) => author.trim()),
        datePublished: currentDate,
        domain: paperData.domains.split(",")[0].trim(),
        tags: paperData.domains.split(",").map((domain) => domain.trim()),
        references: [],
        // TODO:Paper PDF & Image link aws s3 or arweave
        decentralizedStorageURI: "https://irys.xyz/paper.pdf",
        paperImageURI: "https://irys.xyz/paper.png",
      },
      bump: 0,
    });

    await newPaper.save();

    console.log("Paper created successfully:", paperData);
    console.log("Paper file:", paperFile);
    console.log("Paper image:", paperImage);
    return toSuccessResponse(paperData);
  } catch (err: any) {
    console.error("Error in POST handler:", err);
    return toErrResponse(`Error creating research paper: ${err.message}`);
  }
}
