"use client";

import H1 from "@/components/H1";
import Navbar from "@/components/Navbar/Navbar";
import P from "@/components/P";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-10">
      <Navbar />
      <main className="m-auto my-10 max-w-5xl space-y-10 px-3">
        <H1>deResearcher</H1>
        <H1>Profile</H1>
        <P>deResearcher - a decentralized research platform on solana</P>
        <Button
          className="text-white text-center"
          onClick={() => {
            console.log("clicked");
          }}
          size="lg"
        >
          Get Started
        </Button>
      </main>
    </div>
  );
}
