import Image from "next/image";
import { Card } from "../ui/card";
import P from "../P";
import { Button } from "../ui/button";

export type ResearchPaper = {
  title: string;
  domain: string;
  authors: string[];
  image: string;
  description: string;
  accessFee: number;
};

export const ResearchPaperCard = (paper: ResearchPaper) => {
  const { title, domain, authors, image, description, accessFee } = paper;
  return (
    <Card className="border-[2px] border-border">
      <div className="flex flex-col w-full gap-[10px] p-[15px] items-center justify-between h-full">
        <Image src={image} alt={title} width={200} height={200} />
        <div className="flex flex-col gap-[10px] p-[5px]">
          <P className="font-bold text-md">{title}</P>
          <P className="font-bold text-md">Domain : {domain}</P>
          <P className="font-bold text-md">Authors : {authors.join(", ")}</P>
          <P className="font-bold text-md">Description : {description}</P>
          <P className="font-bold text-md">Access Fee: {accessFee} SOL</P>
        </div>
        <Button className="w-full">Access</Button>
      </div>
    </Card>
  );
};
