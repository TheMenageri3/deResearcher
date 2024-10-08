import ProfileComponent from "@/components/Profile";
import MainLayout from "@/app/main-layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage({
  params,
}: {
  params: { pubkey: string };
}) {
  return (
    <MainLayout>
      <div className="flex bg-zinc-100">
        <ProfileComponent pubkey={params.pubkey} />
      </div>
    </MainLayout>
  );
}
