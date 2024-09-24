"use client";
import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvatarWithName } from "../Avatar";

export default function DynamicEditor({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: { title: string; content: string }) => void;
}) {
  const [title, setTitle] = useState(""); // State for the title

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm focus:outline-none max-w-none",
        placeholder: "Write your review here...",
      },
    },
    autofocus: true,
    immediatelyRender: false,
  });

  const handleCancel = () => {
    if (editor) {
      editor.commands.clearContent();
    }
    setTitle("");
    onClose();
  };

  const handleSend = () => {
    if (editor) {
      const htmlContent = editor.getHTML();
      onSubmit({ title, content: htmlContent });
      console.log({ title, content: htmlContent });
      editor.commands.clearContent();
    }
    setTitle("");
    onClose();
  };

  if (!editor) {
    return null;
  }

  return (
    <>
      <div className="flex items-center space-x-3 mb-4">
        <AvatarWithName name="Kim C" />
        <div className="flex-grow">
          <p className="font-semibold">Kim C</p>
        </div>

        {/* <div className="flex space-x-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`text-xl font-bold px-2 py-0 h-auto ${
              editor.isActive("bold")
                ? "bg-zinc-800 text-zinc-200"
                : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300 hover:text-zinc-800"
            } `}
          >
            <Bold className="h-5 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`text-xl italic px-3 py-0 h-auto ${
              editor.isActive("italic")
                ? "bg-zinc-800 text-zinc-200"
                : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300 hover:text-zinc-900"
            } `}
          >
            <Italic className="h-6 w-3" />
          </button>
        </div> */}
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
      `}</style>

      <div className="flex flex-col mb-4">
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter Title"
          className="w-full mb-1 p-2 pl-4 border-b border-zinc-300 text-zinc-600 text-lg font-semibold bg-zinc-200"
        />
      </div>
      <EditorContent
        editor={editor}
        className="w-full min-h-[100px] h-[200px] md:h-[520px] overflow-auto focus:outline-none text-zinc-600 text-base"
      />
      <div className="flex items-center justify-end mt-4 space-x-4">
        <Button
          size="lg"
          className="bg-zinc-300 text-zinc-700 hover:bg-zinc-300/80"
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90"
          onClick={handleSend}
        >
          Send
        </Button>
      </div>
    </>
  );
}
