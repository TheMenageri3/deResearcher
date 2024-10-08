import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongoServer";
import { ResearcherProfileModel } from "@/app/models";
import { ResearcherProfileType, CreateResearcherProfileSchema } from "../types";
import { toErrResponse, toSuccessResponse } from "../helpers";

// create a new researcher profile
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    let unsafeData = await req.json();

    const data = CreateResearcherProfileSchema.parse(unsafeData);

    const researcherProfile: ResearcherProfileType = {
      address: data.address,
      researcherPubkey: data.researcherPubkey,
      bump: data.bump,
      name: data.name,
      state: "AwaitingApproval",
      totalPapersPublished: 0,
      totalCitations: 0,
      totalReviews: 0,
      reputation: 0,
      metaDataMerkleRoot: data.metaDataMerkleRoot,
      metadata: data.metadata,
    };

    const profile = await ResearcherProfileModel.create(researcherProfile);

    return toSuccessResponse(profile);
  } catch (error: any) {
    console.log("Error in POST /api/researcher-profiles:", error);
    if (error.name === "ValidationError") {
      const validationErrors = Object.entries(error.errors).map(
        ([field, err]: [string, any]) => ({
          field,
          message: err.message,
          value: err.value,
        }),
      );
      return toErrResponse(
        "Error in validation : " + JSON.stringify(validationErrors),
      );
    }
    return toErrResponse("Error creating Researcher Profile");
  }
}

// get papers by researcher pubkey
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = req.nextUrl.searchParams;

    const researcherPubkey = searchParams.get("researcherPubkey");

    if (!researcherPubkey) {
      return toErrResponse("researcherPubkey is required");
    }

    const researcherProfile =
      await ResearcherProfileModel.findOne<ResearcherProfileType>({
        researcherPubkey,
      });

    if (!researcherProfile) {
      return toErrResponse("Researcher Profile not found");
    }

    return toSuccessResponse(researcherProfile);
  } catch (error: any) {
    console.error("Error in GET /api/researcher-profiles:", error);
    return toErrResponse("Error fetching Researcher Profile");
  }
}
