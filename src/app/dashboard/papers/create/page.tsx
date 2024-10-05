import React from "react";
import H3 from "@/components/H3";
import CreatePaperForm from "@/components/Paper/PaperCreateForm";

export default function CreatePaperPage() {
  return (
    <>
      <H3 className="text-zinc-700 text-center my-6 font-semibold">
        Create a new paper
      </H3>
      <CreatePaperForm />
    </>
  );
}
