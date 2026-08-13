"use client";

import { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Banner } from "@/services-api/bannerService";
import { DESCRIPTION_LIMIT, TITLE_LIMIT } from "./Utils";

interface BannerFormModalProps {
  isOpen: boolean;
  isEditing: boolean;
  formData: Banner;
  setFormData: Dispatch<SetStateAction<Banner>>;
  isDragActive: boolean;
  setIsDragActive: (active: boolean) => void;
  getImgSrc: (path?: string | null) => string;
  onClose: () => void;
  onSubmit: () => void;
  onFilesAdded: (files: File[]) => void;
  onRemoveImage: (index: number) => void;
}

export const BannerFormModal = ({
  isOpen,
  formData,
  setFormData,
  getImgSrc,
  onClose,
  onSubmit,
  onFilesAdded,
  onRemoveImage,
}: BannerFormModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-[3rem] w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 cursor-pointer z-10"
        >
          <X size={20} />
        </button>

        <div className="p-10 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Upload Section */}
            <div className="w-full flex flex-col items-center">
              {/* Image Preview if exists */}
              {formData.image_url.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {formData.image_url.map((url, i) => (
                    <div
                      key={url + i}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-100 group"
                    >
                      <Image
                        src={getImgSrc(url)}
                        alt="preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <button
                        onClick={() => onRemoveImage(i)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <X size={16} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col items-center">
                <div className="text-center space-y-1 mb-6">
                  <p className="text-[12px] text-slate-400">
                    Supported formats: JPG, PNG, Max size: 4MB.
                  </p>
                  <p className="text-[12px] text-slate-400 leading-tight">
                    Note: Use images with a 1:1.6 aspect ratio (855×1386
                    pixels.)
                  </p>
                </div>

                <label className="bg-[#FFA31A] hover:bg-[#e69217] text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer shadow-sm">
                  Add Image
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files) {
                        onFilesAdded(Array.from(e.target.files));
                        e.target.value = "";
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Input Fields */}
            <div className="w-full space-y-4 pt-4">
              <input
                value={formData.link_url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, link_url: e.target.value }))
                }
                placeholder="Link"
                className="w-full bg-[#F8F9FA] border-none px-6 py-4 rounded-2xl outline-none text-slate-600 placeholder:text-slate-400 text-sm font-medium"
              />

              <div className="relative">
                <input
                  value={formData.meta_title}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      meta_title: e.target.value,
                    }))
                  }
                  placeholder="Meta Title"
                  className="w-full bg-[#F8F9FA] border-none px-6 py-4 rounded-2xl outline-none text-slate-600 placeholder:text-slate-400 text-sm font-medium"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-300">
                  {formData.meta_title.length}/{TITLE_LIMIT}
                </span>
              </div>

              <input
                value={formData.meta_tags}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    meta_tags: e.target.value,
                  }))
                }
                placeholder="Meta Tag"
                className="w-full bg-[#F8F9FA] border-none px-6 py-4 rounded-2xl outline-none text-slate-600 placeholder:text-slate-400 text-sm font-medium"
              />

              <div className="relative">
                <textarea
                  value={formData.meta_description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      meta_description: e.target.value,
                    }))
                  }
                  placeholder="Meta Description"
                  rows={1}
                  className="w-full bg-[#F8F9FA] border-none px-6 py-4 rounded-2xl outline-none text-slate-600 placeholder:text-slate-400 text-sm font-medium resize-none"
                />
                <span className="absolute right-4 bottom-2 text-[10px] text-slate-300">
                  {formData.meta_description?.length}/{DESCRIPTION_LIMIT}
                </span>
              </div>

              {/* Extra Logic Fields (Status & Position) formatted to fit the UI */}
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as "draft" | "active",
                    }))
                  }
                  className="w-full bg-[#F8F9FA] border-none px-6 py-4 rounded-2xl outline-none text-slate-500 text-sm font-bold cursor-pointer appearance-none"
                >
                  <option value="draft">DRAFT</option>
                  <option value="active">PUBLISHED</option>
                </select>

                <input
                  type="number"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      position: parseInt(e.target.value) || 1,
                    }))
                  }
                  placeholder="Position"
                  className="w-full bg-[#F8F9FA] border-none px-6 py-4 rounded-2xl outline-none text-slate-600 text-sm font-medium"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="w-full pt-4">
              <button
                onClick={onSubmit}
                className="bg-[#F1F3F5] hover:bg-[#e9ecef] text-slate-800 px-12 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer min-w-[140px]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
