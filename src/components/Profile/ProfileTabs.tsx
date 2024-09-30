import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProfileTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  setActiveTab,
}) => (
  <Tabs
    defaultValue={activeTab}
    className="w-full mb-6"
    onValueChange={setActiveTab}
  >
    <TabsList className="grid w-full grid-cols-3">
      <TabsTrigger value="contributions">Contributions</TabsTrigger>
      <TabsTrigger value="peer-reviews">Peer Reviews</TabsTrigger>
      <TabsTrigger value="paid-reads">Paid Reads</TabsTrigger>
    </TabsList>
  </Tabs>
);
