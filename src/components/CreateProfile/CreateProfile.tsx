import { Role } from "@/lib/utils/helpers";
import { useState } from "react";
import { Dialog, DialogFooter, DialogHeader } from "../ui/dialog";
import {
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type ProfileData = {
  userName: string;
  pubkey: string;
  role: Role;
  domain: string;
  proofOfWork: string[]; // link to profiles of other research platforms
};

const profileDataKeys = ["UserName", "Pubkey", "Role", "Domain", "ProofOfWork"];

export const CreateProfile = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    userName: "",
    pubkey: "",
    role: Role.Reader,
    domain: "",
    proofOfWork: [],
  });

  const handleProfileDataChange = (key: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create Profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Profile</DialogTitle>
          <DialogDescription>
            Create your profile to start contributing to the platform as a
            researcher or reader.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-[10px] p-[5px]">
          {profileDataKeys.map((key) => (
            <div key={key} className="flex flex-col gap-[5px]">
              <Label htmlFor={key}>{key}</Label>
              <Input
                id={key}
                value={profileData[key.toLowerCase() as keyof ProfileData]}
                onChange={(e) =>
                  handleProfileDataChange(
                    key.toLowerCase() as keyof ProfileData,
                    e.target.value
                  )
                }
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
