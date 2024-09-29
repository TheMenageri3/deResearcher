import { NextRequest, NextResponse } from "next/server";
import { toSuccessResponse, toErrResponse } from "../../helpers";
import Session from "@/app/models/Session.model";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const sessionId = req.cookies.get("sessionId")?.value;
  if (sessionId) {
    try {
      const session = await Session.findOne({ sessionId });
      if (session) {
        const currentTime = new Date();
        const expiresAt = new Date(session.expiresAt);
        if (expiresAt > currentTime) {
          return toSuccessResponse({
            isAuthenticated: true,
            wallet: session.data.wallet,
            expiresAt: session.expiresAt,
          });
        }
      }
    } catch (error) {
      console.error("Error checking session:", error);
    }
  }
  return toSuccessResponse({ isAuthenticated: false, wallet: null });
}
