import ProfileComponent from "@/components/Profile";
import MainLayout from "../main-layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return (
    <MainLayout>
      <div className="flex bg-zinc-100">
        <ProfileComponent />
      </div>
    </MainLayout>
  );
}