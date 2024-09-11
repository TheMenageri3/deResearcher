/* eslint-disable @next/next/no-img-element */
import { Pen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerifyBadge } from "@/components/VerifyBadge";

interface ProfileBannerProps {
  bannerSrc: string;
  avatarSrc: string;
  onEditClick: () => void;
  isVerified?: boolean;
}

export function ProfileBanner({
  bannerSrc,
  avatarSrc,
  onEditClick,
  isVerified = false,
}: ProfileBannerProps) {
  return (
    <div className="relative mb-16">
      <div className="h-52">
        <img
          src={bannerSrc}
          alt="Profile banner"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
        <div className="relative w-24 h-24 border-4 border-white rounded-full">
          <img
            src={avatarSrc}
            alt="Profile avatar"
            className="w-full h-full object-cover rounded-full"
          />
          {isVerified && (
            <div className="absolute bottom-2 -right-1">
              <VerifyBadge className="text-secondary" />
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Button */}
      <div className="absolute top-4 right-4">
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full bg-zinc-800 hover:bg-zinc-700"
          onClick={onEditClick}
        >
          <Pen className="h-4 w-4 text-white" />
        </Button>
      </div>
    </div>
  );
}
