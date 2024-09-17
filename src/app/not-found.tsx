"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900">
      <h1 className="text-4xl font-bold text-zinc-500 mb-4">404 - Not Found</h1>
      <p className="text-xl text-zinc-600 mb-8 text-center">
        Hey, the requested <span className="text-primary">{pathname}</span> page
        is still under development 🥲
      </p>
      <Button asChild>
        <Link href="/dashboard">Return to Dashboard</Link>
      </Button>
    </div>
  );
}
