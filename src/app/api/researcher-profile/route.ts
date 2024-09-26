import { NextRequest, NextResponse } from "next/server";
import { toErrResponse, toSuccessResponse } from "../helpers";
import ResearcherProfileModel, {
  ResearcherProfile,
} from "@/app/models/ResearcherProfile.model";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = req.nextUrl.searchParams;
    const researcherPubkey = searchParams.get("researcherPubkey");
    if (!researcherPubkey) {
      return toErrResponse("researcherPubkey is required");
    }
    const researcherProfile =
      await ResearcherProfileModel.findOne<ResearcherProfile>({
        researcherPubkey,
      });
    if (!researcherProfile) {
      return NextResponse.json(
        { error: "Researcher profile not found" },
        { status: 404 },
      );
    }
    return toSuccessResponse(researcherProfile);
  } catch (err) {
    return toErrResponse("Error fetching researcher profile");
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { publicKey } = await req.json();
    if (!publicKey) {
      return toErrResponse("Public key is required");
    }
    const existingProfile = await ResearcherProfileModel.findOne({
      researcherPubkey: publicKey,
    });
    if (existingProfile) {
      return toErrResponse(
        "A profile with this researcher public key already exists",
      );
    }
    // Create a new researcher profile
    const newProfile = new ResearcherProfileModel({
      address: publicKey,
      researcherPubkey: publicKey,
      name: "Unnamed Researcher",
      state: "AwaitingApproval",
      totalPapersPublished: 0,
      totalCitations: 0,
      totalReviews: 0,
      reputation: 0,
      metaDataMerkleRoot: new Array(64).fill(0),
      metadata: {
        externalResearchProfiles: [],
        interestedDomains: [],
        topPublications: [],
        socialLinks: [],
      },
      bump: 0,
    });

    // await newProfile.save();
    console.log("newProfile", newProfile);
    return toSuccessResponse(newProfile);
  } catch (err) {
    console.error("Error creating researcher profile:", err);
    return toErrResponse("Error creating researcher profile");
  }
}
