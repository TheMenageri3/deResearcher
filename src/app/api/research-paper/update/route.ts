import { NextRequest, NextResponse } from "next/server";

import connectToDatabase from "@/lib/mongoServer";
import { ResearchPaper, ResearchPaperModel } from "@/app/models";
import { ResearchPaperType } from "../../types";

// create a new paper
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    let data = await req.json();
    // Validate that the creator exists
    const paper = await ResearchPaperModel.findOne<ResearchPaperType>({
      address: data.address,
    });

    if (!paper) {
      return NextResponse.json({ error: "Paper not found" }, { status: 404 });
    }

    const researchPaperClone = { ...paper };

    if (data?.state) {
      researchPaperClone.state = data.state;
    }
    if (data?.totalApprovals) {
      researchPaperClone.totalApprovals = data.totalApprovals;
    }

    if (data?.totalCitations) {
      researchPaperClone.totalCitations = data.totalCitations;
    }

    if (data?.totalMints) {
      researchPaperClone.totalMints = data.totalMints;
    }

    await ResearchPaperModel.updateOne(
      { address: paper.address },
      researchPaperClone
    );

    return NextResponse.json(researchPaperClone, { status: 201 });
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
      return NextResponse.json(
        { error: "Validation Error", details: validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
