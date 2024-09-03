"use client";

import { CreateProfile } from "@/components/CreateProfile/CreateProfile";
import H1 from "@/components/H1";
import P from "@/components/P";
import { Button } from "@/components/ui/button";
import { DialogHeader } from "@/components/ui/dialog";

export default function LandingPage() {
  return (
    <div className="m-auto my-10 max-w-5xl space-y-10 px-3">
      <H1>deResearcher</H1>
      <P className="text-[20px] font-bold">
        deResearcher - a decentralized research platform on solana
      </P>
      <div className="flex flex-row justify-between w-full">
        <Button
          className="text-white text-center"
          onClick={() => {
            console.log("clicked");
          }}
        >
          Get Started
        </Button>

        <CreateProfile />
      </div>
    </div>
  );
}
