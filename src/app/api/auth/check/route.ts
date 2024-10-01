import { NextRequest, NextResponse } from "next/server";
import { toSuccessResponse, verifySignature } from "../../helpers";
import SessionModel, { Session } from "@/app/models/Session.model";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const walletSignature = req.cookies.get("walletSignature")?.value;
  const { walletPubkey } = await req.json();
  if (walletSignature && walletPubkey) {
    try {
      const session = await SessionModel.findOne<Session>({
        walletSignature,
        walletPubkey,
      });
      if (session) {
        const isSigVerified = verifySignature(
          session.walletSignature,
          session.walletPubkey
        );
        const currentTime = new Date();
        const expiresAt = new Date(session.expiresAt);
        if (isSigVerified && expiresAt > currentTime) {
          return toSuccessResponse({
            isAuthenticated: true,
            walletSignature: session.walletSignature,
            walletPubkey: session.walletPubkey,
            expiresAt: session.expiresAt,
          });
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  }
  return toSuccessResponse({
    isAuthenticated: false,
    walletSignature: null,
    walletPubkey: null,
  });
}
