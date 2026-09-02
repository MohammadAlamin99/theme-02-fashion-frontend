"use client";

import { useRef, ChangeEvent, FormEvent } from "react";
import Image from "next/image";

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  onSubmit: (e: FormEvent) => void;
  isPending: boolean;
  preview: string | null;
  linkUrl: string;
  setLinkUrl: (url: string) => void;
  showOnce: boolean;
  setShowOnce: (val: boolean) => void;
  isActive: boolean;
  setIsActive: (val: boolean) => void;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function BannerFormModal({
  isOpen,
  onClose,
  onSubmit,
  isPending,
  preview,
  linkUrl,
  setLinkUrl,
  showOnce,
  setShowOnce,
  isActive,
  setIsActive,
  handleFileChange,
}: BannerModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
      {/* Modal Container */}
      <div className="bg-white rounded-[40px] w-full max-w-[440px] p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-8 text-gray-400 hover:text-gray-600 text-2xl transition-colors"
        >
          ✕
        </button>

        <form onSubmit={onSubmit} className="flex flex-col items-center">
          {/* Image / Icon Section */}
          <div className="flex flex-col items-center mb-6 w-full">
            <div className="w-28 h-28 mb-4 relative flex items-center justify-center">
              {preview ? (
                <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-dashed border-gray-200">
                  <Image
                    width={100}
                    height={100}
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="text-gray-300">
                  <svg
                    width="80"
                    height="80"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    <path d="M16 11l2-2 3 3" />
                    <path d="M12 13V7m0 0l-3 3m3-3l3 3" strokeWidth="1.5" />
                  </svg>
                </div>
              )}
            </div>

            {/* Helper Text */}
            <div className="text-center space-y-1 mb-6">
              <p className="text-[#A0A0A0] text-[13px]">
                Supported formats: JPG, PNG, Max size: 4MB.
              </p>
              <p className="text-[#A0A0A0] text-[13px]">
                Note: Use images with a 1:1.6 aspect ratio (855×1386 pixels.)
              </p>
            </div>

            {/* Hidden Input & Orange Button */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#FFA52C] hover:bg-[#ff9408] text-white px-4 py-2 rounded-lg font-semibold text-sm cursor-pointer"
            >
              Add Image
            </button>
          </div>

          {/* Link Input Section */}
          <div className="w-full mb-6">
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Link"
              className="w-full bg-[#F9F9F9] border-none rounded-xl p-4 text-start text-gray-600 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>

          {/* Settings / Checkboxes */}
          <div className="w-full flex flex-col gap-3 mb-8 px-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={showOnce}
                onChange={(e) => setShowOnce(e.target.checked)}
                className="w-4 h-4 rounded accent-[#FFA52C] cursor-pointer"
              />
              <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                Show only once per session
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded accent-[#FFA52C] cursor-pointer"
              />
              <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                Set as Active
              </span>
            </label>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={isPending}
            className="px-6 md:px-10 bg-[#F2F2F2] cursor-pointer hover:bg-gray-200 text-black py-3 rounded-lg font-semibold text-sm"
          >
            {isPending ? "..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
