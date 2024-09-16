import P from "@/components/P";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DashboardCardProps = {
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
};

export default function DashboardCard({
  title,
  description,
  buttonText,
  onClick,
}: DashboardCardProps) {
  return (
    <Card className="border-none h-full flex flex-col text-center">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-zinc-700">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow">
        <P className="flex-grow text-zinc-500 text-sm">{description}</P>
        <Button className="mt-4 w-full" onClick={onClick}>
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
