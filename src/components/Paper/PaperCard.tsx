"use client";
import { generateRandomGradient } from "@/lib/utils/helpers";
import { Button } from "@/components/ui/button";
import { Avatar } from "../Avatar";
import { SolanaLogo } from "../SolanaLogo";
import H4 from "../H4";
import P from "../P";
import { useRouter } from "next/navigation";

interface PaperCardProps {
  id: string;
  title: string;
  authors: string[];
  domain: string;
  minted: number;
  price: number;
  status: string;
}

export default function PaperCard({
  id,
  title,
  authors,
  domain,
  minted,
  price,
  status,
}: PaperCardProps) {
  const gradientStyle = {
    background: generateRandomGradient(),
  };
  const router = useRouter();

  const handleClick = () =>
    router.push(`/research/${status.toLowerCase()}/${id}`);

  return (
    <div className="rounded-lg overflow-hidden shadow-lg cursor-pointer">
      <div className="relative h-48 p-6 md:h-56 group" style={gradientStyle}>
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        <span className="inline-block bg-zinc-800 bg-opacity-50 rounded-full px-3 py-1 text-xs font-semibold text-white mb-2">
          {domain}
        </span>
        <H4 className="text-white font-semibold mb-2 text-balance">{title}</H4>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            variant="secondary"
            className="bg-white text-zinc-800 hover:bg-zinc-100"
            onClick={handleClick}
          >
            Read More
          </Button>
        </div>
      </div>
      <div className="px-6 py-4 bg-white">
        <P className="text-zinc-900 text-sm font-normal mb-2">
          {authors.length === 1 ? authors[0] : authors.join(", ")}
        </P>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mt-8">
          <div className="flex items-center">
            <div className="flex -space-x-2 mr-2">
              {minted > 0 &&
                Array.from({ length: 3 }).map((_, index) => (
                  <Avatar
                    key={index}
                    className="w-6 h-6 border-2 border-white rounded-full shadow-md"
                  />
                ))}
            </div>
            <span className="text-zinc-600 text-xs">{minted} minted</span>
          </div>
          <Button className="w-full sm:w-auto text-xs flex items-center justify-center bg-zinc-800 hover:bg-zinc-700">
            <SolanaLogo className="w-3 h-3 mr-2" />
            {price} SOL
          </Button>
        </div>
      </div>
    </div>
  );
}
