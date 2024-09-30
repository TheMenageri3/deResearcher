import { cookies } from "next/headers";
import Session from "@/app/models/Session.model";

export async function getUserSession() {
  const cookieStore = cookies();
  const walletSignature = cookieStore.get("walletSignature")?.value;

  if (!walletSignature) {
    return null;
  }

  try {
    const session = await Session.findOne({ walletSignature });
    if (session && new Date(session.expiresAt) > new Date()) {
      return session;
    }
  } catch (error) {
    console.error("Error fetching session:", error);
  }

  return null;
}
