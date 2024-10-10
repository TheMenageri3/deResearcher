import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProfileTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="w-full mb-6"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="contributions" onClick={(e) => e.preventDefault()}>
          Contributions
        </TabsTrigger>
        <TabsTrigger value="peer-reviews" onClick={(e) => e.preventDefault()}>
          Peer Reviews
        </TabsTrigger>
        <TabsTrigger value="paid-reads" onClick={(e) => e.preventDefault()}>
          Paid Reads
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
