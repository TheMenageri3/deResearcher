import MainLayout from "@/app/main-layout";
import { Input } from "@/components/ui/input";
import H3 from "@/components/H3";
import { ChevronDown } from "lucide-react";
import PaperList from "../Paper/PaperList";

interface ResearchLayoutProps {
  title: string;
}

export default function ResearchPaperLayout({ title }: ResearchLayoutProps) {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <H3 className="font-bold">{title}</H3>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center mb-8 space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-4 text-xs">
            {["Domain", "Price", "Date", "Popular"].map((filter) => (
              <div key={filter} className="relative">
                <select className="appearance-none border rounded-md px-3 py-2 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>{filter}</option>
                  {/* Add options */}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              </div>
            ))}
          </div>
          <div className="w-full md:w-1/3 lg:w-1/5">
            <Input
              type="text"
              placeholder="Search..."
              className="w-full text-xs"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <PaperList />
        </div>
      </div>
    </MainLayout>
  );
}
