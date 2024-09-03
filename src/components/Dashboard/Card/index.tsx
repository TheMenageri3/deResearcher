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
    <Card className="border-none">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-zinc-700">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <P>{description}</P>
        <Button
          size="lg"
          className="mt-4 bg-primary text-white px-4 py-2 rounded-md w-24"
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
