"use client";

import H1 from "@/components/H1";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="m-auto my-10 max-w-5xl space-y-10 px-3">
      <H1>deResearcher</H1>
      <H1>Profile</H1>
      <p>deResearcher - a decentralized research platform on solana</p>
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
  );
}
