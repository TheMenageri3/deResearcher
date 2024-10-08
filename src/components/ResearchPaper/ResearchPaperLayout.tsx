"use client";

import MainLayout from "@/app/main-layout";
import React, { useEffect, useState } from "react";
import PaperList from "../Paper/PaperList";
import { Input } from "@/components/ui/input";
import H3 from "@/components/H3";
import { ChevronDown } from "lucide-react";
import Spinner from "../Spinner";

interface ResearchLayoutProps {
  title: string;
  state: string;
}

async function fetchPapersByState(state: string) {
  console.log("fetchPapersByState", state);
  const response = await fetch(`/api/research?researchPaperstate=${state}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch papers: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}

export default function ResearchPaperLayout({
  title,
  state,
}: ResearchLayoutProps) {
  const [papers, setPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchPapers() {
      setIsLoading(true);
      try {
        const fetchedPapers = await fetchPapersByState(state);
        console.log("fetchedPapers", fetchedPapers);
        setPapers(fetchedPapers);
      } catch (error) {
        console.error("Error fetching papers:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPapers();
  }, [state, setIsLoading]);

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
        {isLoading ? (
          <Spinner />
        ) : papers.length === 0 ? (
          <div className="text-center text-zinc-500">No papers found </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <PaperList papers={papers} />
          </div>
        )}
      </div>
    </MainLayout>
  );
}
