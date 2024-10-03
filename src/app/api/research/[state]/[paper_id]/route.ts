import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb"; // Import ObjectId from MongoDB
import { ResearchPaperModel } from "@/app/models"; // Import from centralized models index

export async function GET(
  req: NextRequest,
  { params }: { params: { paper_id: string } },
): Promise<NextResponse> {
  try {
    const { paper_id } = params;

    console.log("Paper ID received:", paper_id);

    // Check if the paper_id is a valid MongoDB ObjectId
    if (!ObjectId.isValid(paper_id)) {
      console.log("Invalid ObjectId:", paper_id);
      return NextResponse.json({ error: "Invalid Paper ID" }, { status: 400 });
    }

    const objectId = new ObjectId(paper_id);
    console.log("Converted ObjectId:", objectId);

    // Fetch the paper from MongoDB by `paper_id`
    const paper = await ResearchPaperModel.findById(objectId);

    if (!paper) {
      console.log("Paper not found with ID:", paper_id);
      return NextResponse.json({ error: "Paper not found" }, { status: 404 });
    }

    console.log("Paper found:", paper);
    return NextResponse.json(paper, { status: 200 });
  } catch (error) {
    console.error("Error fetching paper:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
