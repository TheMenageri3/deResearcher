import { NextRequest, NextResponse } from "next/server";
import Session from "@/app/models/Session.model";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const sessionId = req.cookies.get("sessionId")?.value;
  if (sessionId) {
    try {
      await Session.findOneAndDelete({ sessionId });
      console.log("Session deleted successfully");
    } catch (error) {
      console.error("Error deleting session from database:", error);
    }
  }

  const response = NextResponse.json({ message: "Logged out successfully" });
  response.cookies.delete("sessionId");

  return response;
}
