import H3 from "@/components/H3";
import CreatePaperForm from "@/components/Paper/CreatePaperForm";

export default function CreatePaperPage() {
  return (
    <div>
      <H3 className="text-center my-6 font-semibold">Create a new paper</H3>
      <CreatePaperForm />
    </div>
  );
}
