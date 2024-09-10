import ProfileComponent from "@/components/Profile";
import MainLayout from "../main-layout";

export default function ProfilePage() {
  return (
    <MainLayout>
      <div className="flex h-screen bg-zinc-100">
        <ProfileComponent />
      </div>
    </MainLayout>
  );
}
