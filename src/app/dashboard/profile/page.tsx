import ProfileForm from "@/components/Profile/ProfileForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

export default async function UpdateProfilePage() {
  const userData = await getUserData();

  return (
    <>
      <div className="flex justify-end items-center mb-6">
        <Link href="/profile/">
          <Button className="bg-zinc-600 text-white hover:bg-zinc-500 text-xs">
            Go to your public profile
          </Button>
        </Link>
      </div>
      <ProfileForm initialData={userData} />
    </>
  );
}

// TODO: Fetch user data
async function getUserData() {
  return {
    firstName: "",
    lastName: "",
    email: "",
    organization: "",
    website: "",
    socialLink: "",
    bio: "",
    isVerified: true,
  };
}
