"use client";
import { Button } from "@/components/button";

export default function LandingPage() {
  return (
    <div className="w-full h-full mt-10 flex justify-center p-2 flex-col">
      <p>deResearcher - a decentralized research platform on solana</p>
      <Button
        name="Get Started"
        action={() => {
          console.log("Get Started");
        }}
      />
    </div>
  );
}
