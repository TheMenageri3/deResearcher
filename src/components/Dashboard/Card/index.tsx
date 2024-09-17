"use client";

import P from "@/components/P";
import { CreateProfile } from "@/components/Profile/CreateProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

type DashboardCardProps = {
  title: string;
  description: string;
  buttonText: string;
  path: string;
};

export default function DashboardCard({
  title,
  description,
  buttonText,
  path,
}: DashboardCardProps) {
  const router = useRouter();

  return (
    <Card className="border-none h-full flex flex-col text-center">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-zinc-700">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow">
        <P className="flex-grow text-zinc-500 text-sm">{description}</P>
        <Button className="mt-4 w-full" onClick={() => router.push(path)}>
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
