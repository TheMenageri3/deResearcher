"use client";

import P from "@/components/P";
import { Button } from "@/components/ui/button";
import { DialogHeader } from "@/components/ui/dialog";
import MainLayout from "./main-layout";
import H1 from "@/components/H1";

export default function LandingPage() {
  return (
    <MainLayout>
      <div className="m-auto my-10 max-w-5xl space-y-10 px-3">
        <H1 className="font-kalnia">deResearcher</H1>
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
    </MainLayout>
  );
}
