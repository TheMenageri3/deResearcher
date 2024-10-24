import { NextRequest, NextResponse } from "next/server";

import connectToDatabase from "@/lib/mongoServer";
import { ResearchPaperModel } from "@/app/models";
import { ResearchPaperType } from "../../types";
import { toErrResponse, toSuccessResponse } from "../../helpers";

// update the research paper
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const data = await req.json();

    if (!data.address) {
      return toErrResponse("Paper address is required");
    }

    // Find the paper first
    const paper = await ResearchPaperModel.findOne<ResearchPaperType>({
      address: data.address,
    });

    if (!paper) {
      return toErrResponse("Research Paper not found");
    }

    const setFields: {
      [key: string]: any;
    } = {};

    if (data.state) {
      setFields["state"] = data.state;
    }
    if (data.totalApprovals) {
      setFields["totalApprovals"] = data.totalApprovals;
    }
    if (data.totalCitations) {
      setFields["totalCitations"] = data.totalCitations;
    }
    if (data.totalMints) {
      setFields["totalMints"] = data.totalMints;
    }

    // Use findOneAndUpdate to get the updated document
    const updatedPaper = await ResearchPaperModel.findOneAndUpdate(
      { address: data.address },
      { $set: setFields },
      { new: true }, // This option returns the modified document
    );

    if (!updatedPaper) {
      return toErrResponse("Failed to update paper");
    }

    return toSuccessResponse(updatedPaper);
  } catch (error: any) {
    console.error("Error updating research paper:", error);
    return toErrResponse(
      error.name === "ValidationError"
        ? `Validation error: ${JSON.stringify(error.errors)}`
        : "Error updating Research Paper",
    );
  }
}
