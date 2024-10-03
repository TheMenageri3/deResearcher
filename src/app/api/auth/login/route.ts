import { NextRequest, NextResponse } from "next/server";
import {
  toErrResponse,
  toSuccessResponse,
  verifySignature,
} from "../../helpers";
import Session from "@/app/models/Session.model";

const maxAge = 24 * 60 * 60 * 1000; // 1 day

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { walletSignature, walletPubkey } = await req.json();

    if (!walletSignature) {
      return toErrResponse("walletSignature is required");
    }

    if (!walletPubkey) {
      return toErrResponse("walletPubkey is required");
    }

    const isSigVerified = verifySignature(walletSignature, walletPubkey);
    if (!isSigVerified) {
      return toErrResponse("Invalid signature");
    }

    // Check if a session already exists for this wallet
    let session = await Session.findOne({ walletSignature, walletPubkey });

    if (session) {
      // If a session exists, update its expiry
      session.expiresAt = new Date(Date.now() + maxAge);
      await session.save();
    } else {
      // If no session exists, create a new one
      const expiresAt = new Date(Date.now() + maxAge);

      session = new Session({
        walletSignature,
        walletPubkey,
        expiresAt,
      });
      await session.save();
    }

    const response = toSuccessResponse({
      message: "Logged in successfully",
      walletSignature: session.walletSignature,
      walletPubkey: session.walletPubkey,
    });

    response.cookies.set("walletSignature", session.walletSignature, {
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
