import { cookies } from "next/headers";
import Session from "@/app/models/Session.model";

export async function getUserSession() {
  const cookieStore = cookies();
  const sessionId = cookieStore.get("sessionId")?.value;

  if (!sessionId) {
    return null;
  }

  try {
    const session = await Session.findOne({ sessionId });
    if (session && new Date(session.expiresAt) > new Date()) {
      return session;
    }
  } catch (error) {
    console.error("Error fetching session:", error);
  }

  return null;
}
