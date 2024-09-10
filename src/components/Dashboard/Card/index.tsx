"use client";
import P from "@/components/P";
import { CreateProfile } from "@/components/Profile/CreateProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadPaper } from "@/components/UploadPaper/UploadPaper";

type DashboardCardProps = {
  title: string;
  description: string;
  buttonText: string;
};

export default function DashboardCard({
  title,
  description,
  buttonText,
}: DashboardCardProps) {
  const handleClick = () => {
    switch (buttonText) {
      case "Complete Profile":
        return;
      case "Upload Paper":
        return;
      default:
        return;
    }
  };

  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-zinc-700">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-[10px]">
        <P>{description}</P>
        {buttonText === "Complete Profile" ? (
          <CreateProfile />
        ) : (
          <UploadPaper />
        )}
      </CardContent>
    </Card>
  );
}
