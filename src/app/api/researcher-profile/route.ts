import { NextRequest, NextResponse } from "next/server";
import { toErrResponse, toSuccessResponse } from "../helpers";
import ResearcherProfileModel, {
  ResearcherProfile,
} from "@/app/models/ResearcherProfile.model";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = req.nextUrl.searchParams;

    const researcherPubkey = searchParams.get("researcherPubkey");
    const name = searchParams.get("name");

    let findFilters = {};

    if (researcherPubkey) {
      findFilters = { ...findFilters, researcherPubkey };
    }

    if (name) {
      findFilters = { ...findFilters, name };
    }

    if (Object.keys(findFilters).length === 0) {
      return toErrResponse(
        "No search parameters provided, at least one of researcherPubkey or name is required"
      );
    }

    const researcherProfile =
      await ResearcherProfileModel.findOne<ResearcherProfile>(findFilters);

    if (!researcherProfile) {
      return toErrResponse("Researcher profile not found");
    }

    return toSuccessResponse(researcherProfile);
  } catch (err) {
    return toErrResponse("Error fetching peer reviews");
  }
}
