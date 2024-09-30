import { NextRequest, NextResponse } from "next/server";
import Session from "@/app/models/Session.model";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const walletSignature = req.cookies.get("walletSignature")?.value;
  const { walletPubkey } = await req.json();
  if (walletSignature && walletPubkey) {
    try {
      await Session.findOneAndDelete({ walletSignature, walletPubkey });
      console.log("Session deleted successfully");
    } catch (error) {
      console.error("Error deleting session from database:", error);
    }
  }

  const response = NextResponse.json({ message: "Logged out successfully" });
  response.cookies.delete("walletSignature");

  return response;
}
