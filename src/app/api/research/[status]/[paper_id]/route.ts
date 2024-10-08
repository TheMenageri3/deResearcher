import { ResearchPaperModel } from "@/app/models";
import connectToDatabase from "@/lib/mongoServer";
import { NextRequest, NextResponse } from "next/server";
import { ResearchPaper } from "@/app/models/ResearchPaper.model";

export async function GET(
  req: NextRequest,
  { params }: { params: { status: string; paper_id: string } },
): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const { status, paper_id } = params;

    console.log("Fetching paper with status:", status, "and ID:", paper_id);

    const paper = await ResearchPaperModel.findOne<ResearchPaper>({
      _id: paper_id,
      state: status,
    }).lean();

    if (!paper) {
      console.log("Paper not found");
      return NextResponse.json({ error: "Paper not found" }, { status: 404 });
    }

    console.log("Paper found:", paper);
    return NextResponse.json(paper);
  } catch (error: any) {
    console.error("Error in GET /api/research/[status]/[paper_id]:", error);
    return NextResponse.json(
      { error: "Error fetching Research Paper" },
      { status: 500 },
    );
  }
}
