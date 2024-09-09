"use client";

import { CreateProfile } from "@/components/Profile/CreateProfile";
import H1 from "@/components/H1";
import P from "@/components/P";
import { Button } from "@/components/ui/button";
import { DialogHeader } from "@/components/ui/dialog";
import MainLayout from "./main-layout";
import { ResearchPapers } from "@/components/ResearchPaper/ResearchPapers";

export default function LandingPage() {
  return (
    <div className="flex flex-col m-auto my-10 max-w-5xl space-y-10 px-3 gap-[20px]">
      <H1>deResearcher</H1>
      <P className="text-[20px] font-bold">
        deResearcher - a decentralized research platform on solana
      </P>

      <ResearchPapers />
      {/* <Button
          className="text-white text-center"
          onClick={() => {
            console.log("clicked");
          }}
          size="lg"
        >
          Get Started
        </Button> */}
    </div>
  );
}
