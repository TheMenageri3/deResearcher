/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { ProfileFormData } from "@/lib/validation";
import CustomFormItem from "../CustomForm";

import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

type ProfileFormProps = {
  initialData: ProfileFormData & { isVerified: boolean; id: string };
};

export default function ProfileForm({ initialData }: ProfileFormProps) {
  // const [isEditing, setIsEditing] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof ProfileFormData>>({
    resolver: zodResolver(ProfileFormData),
    defaultValues: initialData,
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("profileImage", file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (values: ProfileFormData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Profile created:", values);
      // setIsEditing(false);
      router.push(`/profile/${initialData.id}`);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };
  return (
    // <Form {...form}>
    //   <form
    //     onSubmit={form.handleSubmit(handleSubmit)}
    //     className="space-y-6 max-w-4xl mx-auto bg-white p-6 pb-12 md:p-20 md:pt-6 md:pb-16 rounded-lg shadow"
    //   >
    //     <div className="flex flex-col items-center mb-6">
    //       <div
    //         className={`w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-2 overflow-hidden relative ${
    //           isEditing ? "cursor-pointer group" : ""
    //         }`}
    //         onClick={() => isEditing && fileInputRef.current?.click()}
    //       >
    //         {form.watch("profileImage") ? (
    //           <img
    //             src={form.watch("profileImage")}
    //             alt="Profile"
    //             className="w-full h-full object-cover"
    //           />
    //         ) : (
    //           <Camera size={32} className="text-gray-400" />
    //         )}
    //         {isEditing && (
    //           <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
    //             <Upload size={24} className="text-white" />
    //           </div>
    //         )}
    //       </div>
    //       <input
    //         type="file"
    //         ref={fileInputRef}
    //         onChange={handleImageUpload}
    //         accept="image/png, image/jpeg"
    //         className="hidden"
    //         disabled={!isEditing}
    //       />
    //     </div>

    //     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //       <FormField
    //         control={form.control}
    //         name="firstName"
    //         render={({ field }) => (
    //           <CustomFormItem
    //             label="First Name"
    //             field={field}
    //             placeholder="Enter your first name"
    //             isEditing={isEditing}
    //           />
    //         )}
    //         required
    //       />
    //       <FormField
    //         control={form.control}
    //         name="lastName"
    //         render={({ field }) => (
    //           <CustomFormItem
    //             label="Last Name"
    //             field={field}
    //             placeholder="Enter your last name"
    //             isEditing={isEditing}
    //           />
    //         )}
    //         required
    //       />
    //     </div>

    //     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //       <FormField
    //         control={form.control}
    //         name="email"
    //         render={({ field }) => (
    //           <CustomFormItem
    //             label="Email"
    //             field={field}
    //             placeholder="Enter your email"
    //             isEditing={isEditing}
    //           />
    //         )}
    //         required
    //       />
    //       <FormField
    //         control={form.control}
    //         name="organization"
    //         render={({ field }) => (
    //           <CustomFormItem
    //             label="Organization"
    //             field={field}
    //             placeholder="Enter your organization"
    //             isEditing={isEditing}
    //           />
    //         )}
    //       />
    //     </div>

    //     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //       <FormField
    //         control={form.control}
    //         name="website"
    //         render={({ field }) => (
    //           <CustomFormItem
    //             label="Websit/Github"
    //             field={field}
    //             placeholder="Enter your website"
    //             isEditing={isEditing}
    //           />
    //         )}
    //       />
    //       <FormField
    //         control={form.control}
    //         name="socialLink"
    //         render={({ field }) => (
    //           <CustomFormItem
    //             label="Twitter/X/Facebook/LinkedIn"
    //             field={field}
    //             placeholder="Enter your social link"
    //             isEditing={isEditing}
    //           />
    //         )}
    //       />
    //     </div>

    //     <FormField
    //       control={form.control}
    //       name="bio"
    //       render={({ field }) => (
    //         <CustomFormItem
    //           label="Bio"
    //           field={field}
    //           placeholder="Exploring the intersection of cryptography and..."
    //           InputComponent={Textarea}
    //           isEditing={isEditing}
    //           inputProps={{ rows: 6 }}
    //         />
    //       )}
    //     />

    //     <div className="flex justify-end gap-4">
    //       <Button
    //         type="submit"
    //         className={`w-40 ${
    //           isEditing
    //             ? "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
    //             : "bg-transparent text-zinc-800 hover:bg-zinc-100"
    //         }`}
    //         variant={isEditing ? "default" : "outline"}
    //         disabled={!isEditing || form.formState.isSubmitting}
    //       >
    //         {form.formState.isSubmitting ? "Submitting..." : "Update Profile"}
    //       </Button>
    //       <Button
    //         type="button"
    //         className={`w-40 ${
    //           isEditing
    //             ? "bg-transparent text-zinc-800 hover:bg-zinc-100"
    //             : "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
    //         }`}
    //         variant={isEditing ? "outline" : "default"}
    //         disabled={form.formState.isSubmitting}
    //         onClick={() => {
    //           if (isEditing) {
    //             form.reset(initialData);
    //           }
    //           setIsEditing(!isEditing);
    //         }}
    //       >
    //         {isEditing ? "Cancel" : "Edit"}
    //       </Button>
    //     </div>
    //   </form>
    // </Form>
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 max-w-4xl mx-auto bg-white p-6 pb-12 md:p-20 md:pt-6 md:pb-16 rounded-lg shadow"
      >
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-2 overflow-hidden relative cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            {form.watch("profileImage") ? (
              <img
                src={form.watch("profileImage")}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera size={32} className="text-gray-400" />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Upload size={24} className="text-white" />
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/png, image/jpeg"
            className="hidden"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <CustomFormItem
                label="First Name"
                field={field}
                placeholder="Enter your first name"
              />
            )}
            required
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <CustomFormItem
                label="Last Name"
                field={field}
                placeholder="Enter your last name"
              />
            )}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <CustomFormItem
                label="Email"
                field={field}
                placeholder="Enter your email"
              />
            )}
            required
          />
          <FormField
            control={form.control}
            name="organization"
            render={({ field }) => (
              <CustomFormItem
                label="Organization"
                field={field}
                placeholder="Enter your organization"
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <CustomFormItem
                label="Website/Github"
                field={field}
                placeholder="Enter your website"
              />
            )}
          />
          <FormField
            control={form.control}
            name="socialLink"
            render={({ field }) => (
              <CustomFormItem
                label="Twitter/X/Facebook/LinkedIn"
                field={field}
                placeholder="Enter your social link"
              />
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <CustomFormItem
              label="Bio"
              field={field}
              placeholder="Exploring the intersection of cryptography and..."
              InputComponent={Textarea}
              inputProps={{ rows: 6 }}
            />
          )}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            className="w-40 bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Creating..." : "Create Profile"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
