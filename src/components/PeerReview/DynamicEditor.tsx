"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvatarImageOrName } from "../Avatar";
import Placeholder from "@tiptap/extension-placeholder";
import { INITIALRATING, PLACEHOLDER } from "@/lib/constants";
import { RatingSchema } from "@/lib/validation";
import { useUserStore } from "@/app/store/userStore";

export default function DynamicEditor({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    content: string;
    rating: RatingSchema;
  }) => void;
}) {
  const { researcherProfile } = useUserStore();

  const [title, setTitle] = useState("");
  const [rating, setRating] = useState<RatingSchema>(INITIALRATING);
  const [errors, setErrors] = useState<{
    title?: boolean;
    content?: boolean;
    rating: { [key: string]: boolean };
  }>({ rating: {} });
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: PLACEHOLDER,
      }),
    ],
    editorProps: {
      attributes: {
        class: "prose prose-sm focus:outline-none max-w-none is-editor-empty",
      },
    },
    immediatelyRender: false,
  });

  const validateForm = useCallback(() => {
    const newErrors = {
      title: title.trim() === "",
      content: editor?.isEmpty,
      rating: Object.fromEntries(
        Object.entries(rating).map(([key, value]) => [
          key,
          value === undefined || value < 0.1 || value > 5.0,
        ]),
      ),
    };
    setErrors(newErrors);
    return newErrors;
  }, [title, rating, editor?.isEmpty]);

  useEffect(() => {
    validateForm();
  }, [validateForm]);

  const isFormValid = (formErrors: ReturnType<typeof validateForm>) => {
    return (
      !formErrors.title &&
      !formErrors.content &&
      Object.values(formErrors.rating).every((error) => !error)
    );
  };

  const handleSend = () => {
    const formErrors = validateForm();
    setAttemptedSubmit(true);

    if (isFormValid(formErrors) && editor) {
      const htmlContent = editor.getHTML();
      onSubmit({ title, content: htmlContent, rating });
      editor.commands.clearContent();
      setTitle("");
      setAttemptedSubmit(false);
      onClose();
    }
  };

  const handleCancel = () => {
    if (editor) {
      editor.commands.clearContent();
    }
    setTitle("");
    onClose();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-3 mb-4">
        <AvatarImageOrName
          name={researcherProfile?.name || ""}
          imageUrl={researcherProfile?.metadata.profileImageURI || undefined}
        />
        <div className="flex-grow">
          <p className="font-semibold text-zinc-300">
            {researcherProfile?.name || ""}
          </p>
        </div>
      </div>
      <style jsx global>{`
        .ProseMirror p {
          padding-bottom: 1rem;
          line-height: 1.4;
          padding-inline: 0.5rem;
        }
        .ProseMirror p:last-child {
          margin-bottom: 0;
        }
        .tiptap p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
          font-size: 1rem;
        }
      `}</style>

      <div className="flex flex-col mb-4">
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Review Title"
          className={`w-full mb-1 p-2 pl-4 border-b text-zinc-600 text-lg font-semibold bg-zinc-50 transition-colors duration-300 ${
            attemptedSubmit && errors.title
              ? "border-destructive"
              : "border-zinc-300"
          }`}
        />
      </div>

      <div className="flex-grow flex flex-col overflow-hidden">
        <EditorContent
          editor={editor}
          className={`flex-grow overflow-auto focus:outline-none text-zinc-600 text-base bg-zinc-50 p-2 transition-colors duration-300 ${
            attemptedSubmit && errors.content ? "border border-destructive" : ""
          }`}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 bg-zinc-800 p-4 mt-auto">
        {Object.entries(rating).map(([key, value]) => {
          const formattedKey = key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase());

          return (
            <div key={key} className="contents">
              <label className="text-zinc-300 text-sm font-semibold flex items-center">
                {formattedKey}
              </label>
              <input
                type="number"
                value={value ?? ""}
                onChange={(e) => {
                  const newValue =
                    e.target.value === "" ? undefined : Number(e.target.value);
                  setRating({ ...rating, [key]: newValue });
                }}
                min={0.1}
                max={5}
                step={0.1}
                placeholder="0.1 - 5.0"
                className={`w-full bg-zinc-700 text-zinc-100 p-2 text-sm text-center transition-colors duration-300 ${
                  attemptedSubmit && errors.rating[key]
                    ? "border border-destructive"
                    : ""
                }`}
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between space-x-4 mb-8">
        <Button
          size="lg"
          className="bg-zinc-300 text-zinc-700 hover:bg-zinc-300/80 w-full"
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button
          size="lg"
          className="w-full bg-primary hover:bg-primary/90"
          onClick={handleSend}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
