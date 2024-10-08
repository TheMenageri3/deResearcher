import { cookies } from "next/headers";
import DashboardContent from "@/components/Dashboard/Content";

export default async function DashboardPage() {
  const cookieStore = cookies();
  const authCookie = cookieStore.get("session");
  let user = { isAuthenticated: false, wallet: null };

  if (authCookie) {
    try {
      user = JSON.parse(authCookie.value);
    } catch (error) {
      console.error("Error parsing auth cookie:", error);
    }
  }

  return <DashboardContent initialAuthState={user} />;
}
