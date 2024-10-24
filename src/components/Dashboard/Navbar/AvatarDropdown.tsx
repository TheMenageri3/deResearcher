"use client";
import { Avatar } from "@/components/Avatar";
import { WalletDropdown } from "@/components/WalletDropdown";
import { useUserStore } from "@/app/store/userStore";
import Image from "next/image";

export const AvatarDropdown = () => {
  const { researcherProfile } = useUserStore();

  const triggerComponent = (
    <button className="flex items-center gap-3 max-w-xs bg-white text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
      <span className="sr-only">Open user menu</span>
      <div>
        {researcherProfile?.metadata.profileImageURI ? (
          <Image
            src={researcherProfile.metadata.profileImageURI}
            alt="Profile"
            width={32}
            height={32}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <Avatar className="h-8 w-8 rounded-full" />
        )}
      </div>
    </button>
  );

  return (
    <WalletDropdown triggerComponent={triggerComponent} showProfileImage />
  );
};
