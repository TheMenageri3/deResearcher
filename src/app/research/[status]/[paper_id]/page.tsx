import MainLayout from "@/app/main-layout";
import PaperContentComponent from "@/components/Paper/PaperContent";
import { SolanaLogo } from "@/components/SolanaLogo";
import { Button } from "@/components/ui/button";

export default function PaperContentPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 pb-20">
        <PaperContentComponent />
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-100/50 backdrop-blur-md border-t border-zinc-200/20 p-4 flex justify-end items-center px-20">
        <Button className="w-full md:w-[240px] text-sm flex items-center justify-center bg-primary hover:bg-primary/90">
          <SolanaLogo className="w-3 h-3 mr-2" />1 SOL
        </Button>
      </div>
    </MainLayout>
  );
}
