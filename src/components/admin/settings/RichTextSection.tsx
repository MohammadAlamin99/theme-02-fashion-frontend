"use client";
import { useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";

// Toolbar Button Component
const MenuButton = ({
  onClick,
  isActive,
  children,
}: {
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-2 rounded hover:bg-gray-100 transition-colors ${
      isActive ? "bg-gray-200 text-blue-600" : "text-gray-500"
    }`}
  >
    {children}
  </button>
);

// --- আলাদা এডিটর কম্পোনেন্ট যা হুক এরর ফিক্স করবে ---
const TiptapEditor = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      Link.configure({ openOnClick: false }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm focus:outline-none min-h-[175px] p-4 text-sm bg-[#F9F9F9] rounded-b-[8px] max-w-none border-none",
      },
    },
  });

  // ডাটাবেস থেকে ডাটা আসলে এডিটর আপডেট করার জন্য
  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="min-h-[175px] bg-[#F9F9F9] animate-pulse rounded-b-[8px]" />
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-[8px] overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-white border-b border-gray-100">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
        >
          <Bold size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
        >
          <Italic size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
        >
          <UnderlineIcon size={18} />
        </MenuButton>

        <div className="w-[1px] h-6 bg-gray-200 mx-2 self-center" />

        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
        >
          <List size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
        >
          <ListOrdered size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
        >
          <Quote size={18} />
        </MenuButton>
      </div>

      {/* Editor Content Area */}
      <div className="relative">
        <EditorContent editor={editor} />
        {editor.isEmpty && (
          <div className="absolute top-4 left-4 text-gray-400 pointer-events-none text-sm">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
};

// --- মেইন এক্সপোর্ট কম্পোনেন্ট ---
export const RichTextSection = ({
  title,
  placeholder,
  name,
}: {
  title: string;
  placeholder: string;
  name: string;
}) => {
  const { control } = useFormContext();

  return (
    <div className="mb-8">
      <h3 className="text-[22px] font-bold text-black mb-4 font-lato">
        {title}
      </h3>

      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <TiptapEditor
            value={field.value}
            onChange={field.onChange}
            placeholder={placeholder}
          />
        )}
      />
    </div>
  );
};
