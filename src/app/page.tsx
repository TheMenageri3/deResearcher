"use client";

import H1 from "@/components/H1";
import P from "@/components/P";
import { Button } from "@/components/ui/button";
import { DialogHeader } from "@/components/ui/dialog";

export default function LandingPage() {
  return (
    <div className="m-auto my-10 max-w-5xl space-y-10 px-3">
      <H1>deResearcher</H1>
      <P className="text-[20px]">
        deResearcher - a decentralized research platform on solana
      </P>
      <Button
        className="text-white text-center"
        onClick={() => {
          console.log("clicked");
        }}
        size="lg"
      >
        Get Started
      </Button>
    </div>
  );
}
