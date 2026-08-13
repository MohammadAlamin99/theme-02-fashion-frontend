"use client";

import React, { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Link as LinkExtension } from "@tiptap/extension-link";
import { Image as ImageExtension } from "@tiptap/extension-image";
import { TextAlign } from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Superscript } from "@tiptap/extension-superscript";
import { Subscript } from "@tiptap/extension-subscript";
import { Youtube } from "@tiptap/extension-youtube";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Quote,
  List,
  ListOrdered,
  Image as ImageIcon,
  Link as LinkIcon,
  PlayCircle,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RemoveFormatting,
  ChevronDown,
  Type,
} from "lucide-react";
import { FontSize } from "./tiptap-font-size";

// Reuses your existing product-media upload endpoint for inline editor images
import { uploadProductMedia } from "@/services-api/productService";
import toast from "react-hot-toast";

const HEADING_OPTIONS = [
  { label: "Normal", level: 0 },
  { label: "Heading 1", level: 1 },
  { label: "Heading 2", level: 2 },
  { label: "Heading 3", level: 3 },
];

const FONT_SIZES = [
  { label: "Small", value: "13px" },
  { label: "Normal", value: "16px" },
  { label: "Large", value: "20px" },
  { label: "X-Large", value: "26px" },
];

const ToolbarButton = ({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onClick={onClick}
    className={`w-8 h-8 flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-200 transition-colors shrink-0 ${
      active ? "bg-gray-200 text-black" : ""
    } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
  >
    {children}
  </button>
);

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Ex: Description",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [headingOpen, setHeadingOpen] = useState(false);
  const [fontSizeOpen, setFontSizeOpen] = useState(false);
  const [, forceRerender] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextStyle,
      Color,
      FontSize,
      Superscript,
      Subscript,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      LinkExtension.configure({ openOnClick: false, autolink: true }),
      ImageExtension.configure({ inline: false, allowBase64: false }),
      Youtube.configure({ width: 480, height: 270, nocookie: true }),
    ],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[140px] outline-none text-sm text-gray-800 px-4 py-3",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onSelectionUpdate: () => forceRerender((n) => n + 1),
    onTransaction: () => forceRerender((n) => n + 1),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // শুধুমাত্র তখনই কন্টেন্ট সেট করবে যখন ডাটাবেসের ভ্যালু এবং এডিটরের ভ্যালু আলাদা হবে
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  if (!editor) return null;

  const currentHeadingLabel =
    HEADING_OPTIONS.find((h) =>
      h.level === 0
        ? editor.isActive("paragraph")
        : editor.isActive("heading", { level: h.level }),
    )?.label ?? "Normal";

  const handleSetHeading = (level: number) => {
    if (level === 0) editor.chain().focus().setParagraph().run();
    else
      editor
        .chain()
        .focus()
        .toggleHeading({ level: level as 1 | 2 | 3 })
        .run();
    setHeadingOpen(false);
  };

  const handleSetFontSize = (size: string) => {
    editor.chain().focus().setFontSize(size).run();
    setFontSizeOpen(false);
  };

  const handleInsertLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const handleInsertVideo = () => {
    const url = window.prompt("Enter YouTube video URL");
    if (!url) return;
    editor.commands.setYoutubeVideo({ src: url });
  };

  const handleImageButtonClick = () => imageInputRef.current?.click();
  const exitListIfActive = () => {
    if (editor.isActive("bulletList") || editor.isActive("orderedList")) {
      editor.chain().focus().liftListItem("listItem").run();
    }
  };

  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    exitListIfActive();

    try {
      setUploadingImage(true);
      const paths = await uploadProductMedia(files);
      const baseStorageUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
        "http://localhost:8082";
      paths.forEach((p: string) => {
        const src = p.startsWith("http")
          ? p
          : `${baseStorageUrl}/${p.replace(/^\/+/, "")}`;
        editor.chain().focus().setImage({ src }).run();
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to upload image");
      }
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full bg-[#F9F9F9] rounded-[8px] border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-all overflow-hidden">
      {/* ── TOOLBAR ── */}
      <div className="flex items-center gap-1 flex-wrap px-2 py-2 border-b border-gray-200 bg-[#F3F3F3] relative">
        {/* Heading / Normal dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setHeadingOpen((o) => !o)}
            className="flex items-center gap-1 px-2.5 h-8 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-200 cursor-pointer"
          >
            {currentHeadingLabel}
            <ChevronDown size={12} />
          </button>
          {headingOpen && (
            <div className="absolute top-9 left-0 z-20 bg-white border border-gray-200 rounded-md shadow-md py-1 w-32">
              {HEADING_OPTIONS.map((h) => (
                <div
                  key={h.level}
                  onClick={() => handleSetHeading(h.level)}
                  className="px-3 py-1.5 text-xs hover:bg-gray-100 cursor-pointer"
                >
                  {h.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <ToolbarButton
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Blockquote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={15} />
        </ToolbarButton>

        {/* Text color */}
        <label
          title="Text Color"
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 cursor-pointer relative"
        >
          <span
            className="font-bold text-sm"
            style={{
              color: editor.getAttributes("textStyle").color || "#E30000",
            }}
          >
            A
          </span>
          <input
            type="color"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) =>
              editor.chain().focus().setColor(e.target.value).run()
            }
          />
        </label>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <ToolbarButton
          title="Align Left"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Align Center"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Align Right"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight size={15} />
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <ToolbarButton
          title="Bullet List"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Ordered List"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={15} />
        </ToolbarButton>

        <ToolbarButton
          title="Clear Formatting"
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
        >
          <RemoveFormatting size={15} />
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <ToolbarButton
          title="Insert Image"
          onClick={handleImageButtonClick}
          disabled={uploadingImage}
        >
          <ImageIcon size={15} />
        </ToolbarButton>
        <input
          type="file"
          ref={imageInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageFileChange}
        />

        <ToolbarButton
          title="Insert Link"
          active={editor.isActive("link")}
          onClick={handleInsertLink}
        >
          <LinkIcon size={15} />
        </ToolbarButton>

        <ToolbarButton
          title="Insert Video (YouTube)"
          onClick={handleInsertVideo}
        >
          <PlayCircle size={15} />
        </ToolbarButton>

        {/* Font size dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setFontSizeOpen((o) => !o)}
            className="flex items-center gap-1 px-2 h-8 rounded-md text-gray-600 hover:bg-gray-200 cursor-pointer"
            title="Font Size"
          >
            <Type size={15} />
            <ChevronDown size={12} />
          </button>
          {fontSizeOpen && (
            <div className="absolute top-9 right-0 z-20 bg-white border border-gray-200 rounded-md shadow-md py-1 w-28">
              {FONT_SIZES.map((f) => (
                <div
                  key={f.value}
                  onClick={() => handleSetFontSize(f.value)}
                  className="px-3 py-1.5 text-xs hover:bg-gray-100 cursor-pointer"
                >
                  {f.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── EDITABLE CONTENT AREA ── */}
      <div className="relative">
        {editor.isEmpty && (
          <span className="absolute top-3 left-4 text-sm text-[#A2A2A2] pointer-events-none select-none">
            {placeholder}
          </span>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
