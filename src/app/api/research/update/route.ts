import { NextRequest, NextResponse } from "next/server";

import connectToDatabase from "@/lib/mongoServer";
import { ResearchPaperModel } from "@/app/models";
import { ResearchPaperType } from "../../types";
import { toErrResponse, toSuccessResponse } from "../../helpers";

// update the research paper
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    let data = await req.json();
    // Validate that the creator exists
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

    await ResearchPaperModel.updateOne(
      { address: paper.address },
      {
        $set: setFields,
      }
    );

    return toSuccessResponse(paper);
  } catch (error: any) {
    console.error("Error in POST /api/research-papers:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.entries(error.errors).map(
        ([field, err]: [string, any]) => ({
          field,
          message: err.message,
          value: err.value,
        })
      );
      return toErrResponse(
        "Error in validation : " + JSON.stringify(validationErrors)
      );
    }

    return toErrResponse("Error updating Research Paper");
  }
}
