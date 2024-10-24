/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { PaperFormData } from "@/lib/validation";
import { usePaperStore } from "@/app/store/paperStore";
import CustomFormItem from "../CustomForm";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Loader2, Upload } from "lucide-react";
import { z } from "zod";
import React from "react";
import toast from "react-hot-toast";

type PaperFormDataType = z.infer<typeof PaperFormData>;

export default function CreatePaperForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { createResearchPaper, isLoading, error, setError } = usePaperStore();

  const form = useForm<PaperFormDataType>({
    resolver: zodResolver(PaperFormData),
    defaultValues: {
      title: "",
      authors: [],
      domains: [],
      abstract: "",
      paperImage: undefined,
      paperFile: undefined,
      accessFee: 0,
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("paperImage", file);
    }
  };

  const handlePDFUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    form.setValue("paperFile", file as File);
  };

  const handleSubmit = async (values: PaperFormDataType) => {
    try {
      setError(null);
      const result = await createResearchPaper(values);

      if (result.success) {
        toast.success("Paper created successfully!");
        router.push("/dashboard/papers/overview");
      } else {
        console.log(result.error);
        const errorMessage = result.error || "Failed to create paper";
        toast.error(errorMessage);
        setError(errorMessage);
      }
    } catch (error) {
      console.error("Error creating paper:", error);
      const errorMessage =
        "An unexpected error occurred while creating the paper";
      toast.error(errorMessage);
      setError(errorMessage);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/papers/overview");
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 max-w-4xl mx-auto bg-white p-6 pb-12 md:p-20 md:pt-6 md:pb-16 rounded-lg shadow"
      >
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <CustomFormItem
                label="Paper Title"
                field={field}
                placeholder="Enter your title"
              />
            )}
            required
          />
          <FormField
            control={form.control}
            name="authors"
            render={({ field }) => (
              <CustomFormItem
                label="Authors (comma-separated)"
                field={field}
                placeholder="Albert Einstein, Isaac Newton"
              />
            )}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="domains"
              render={({ field }) => (
                <CustomFormItem
                  label="Domains (comma-separated)"
                  field={field}
                  placeholder="Cryptography, Blockchain"
                />
              )}
              required
            />
            <FormField
              control={form.control}
              name="accessFee"
              render={({ field }) => (
                <CustomFormItem
                  label="Price"
                  field={field}
                  placeholder="Enter price (SOL)"
                  inputProps={{
                    type: "number",
                    min: 0,
                    step: 0.1,
                  }}
                />
              )}
              required
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="abstract"
          render={({ field }) => (
            <CustomFormItem
              label="Abstract / Description"
              field={field}
              placeholder="Enter paper abstract"
              InputComponent={Textarea}
              inputProps={{ rows: 10 }}
            />
          )}
          required
        />

        {/* Image and PDF Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-700">
              Paper Image (Optional)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`h-28 w-28 cursor-pointer rounded-md flex items-center justify-center transition-colors ${
                form.watch("paperImage")
                  ? ""
                  : "border-2 border-dashed border-gray-300 hover:border-gray-400"
              }`}
            >
              {form.watch("paperImage") ? (
                <img
                  src={
                    form.watch("paperImage") instanceof File
                      ? URL.createObjectURL(form.watch("paperImage") as File)
                      : undefined
                  }
                  alt="Paper"
                  className="h-full w-full object-cover rounded-md"
                />
              ) : (
                <Camera className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/png"
              className="hidden"
            />
          </div>

          <FormField
            control={form.control}
            name="paperFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-xs font-bold text-zinc-700">
                  Paper PDF <span className="text-destructive">*</span>
                </FormLabel>
                <div className="flex flex-col space-y-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => pdfInputRef.current?.click()}
                    className="w-full md:w-auto bg-white py-2 px-3 border border-zinc-300 rounded-md shadow-sm text-xs leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload PDF
                  </Button>
                  {field.value && (
                    <span className="text-xs text-zinc-500 truncate">
                      {(field.value as File).name}
                    </span>
                  )}
                  <input
                    type="file"
                    ref={pdfInputRef}
                    onChange={(e) => {
                      handlePDFUpload(e);
                      field.onChange(e.target.files?.[0]);
                    }}
                    accept=".pdf"
                    className="hidden"
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {error && <p className="text-destructive">{error}</p>}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            className="w-40 bg-transparent text-zinc-800 hover:bg-zinc-100"
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="w-40 bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
            variant="default"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Paper"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
