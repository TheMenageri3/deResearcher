import { NextRequest, NextResponse } from "next/server";
import { toErrResponse, toSuccessResponse } from "../../helpers";
import Session from "@/app/models/Session.model";
import crypto from "crypto";

const maxAge = 10 * 60 * 1000; // 10 minutes

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { wallet } = await req.json();
    if (!wallet) {
      return toErrResponse("Wallet is required");
    }

    // Check if a session already exists for this wallet
    let session = await Session.findOne({ "data.wallet": wallet });

    if (session) {
      // If a session exists, update its expiry
      session.expiresAt = new Date(Date.now() + maxAge);
      await session.save();
    } else {
      // If no session exists, create a new one
      const sessionId = generateSessionId();
      const userData = { isAuthenticated: true, wallet };
      const expiresAt = new Date(Date.now() + maxAge);

      session = new Session({
        sessionId,
        data: userData,
        expiresAt,
      });
      await session.save();
    }

    const response = toSuccessResponse({
      message: "Logged in successfully",
      sessionId: session.sessionId,
    });

    response.cookies.set("sessionId", session.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: maxAge / 1000,
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return toErrResponse("Error logging in");
  }
}

function generateSessionId(): string {
  return crypto.randomBytes(32).toString("hex");
}
