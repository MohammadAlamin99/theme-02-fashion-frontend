"use client";

import Image from "next/image";
import {
  CheckCircle2,
  ImageOff,
  Loader2,
  SquarePen,
  Trash2,
} from "lucide-react";
import { LocalBanner } from "./caurousel.typ";

interface BannerCardProps {
  banner: LocalBanner;
  isPending: boolean;
  isSaving: boolean;
  isDeleteDisabled: boolean;
  getImgSrc: (path?: string | null) => string;
  onEdit: (banner: LocalBanner) => void;
  onPublish: (banner: LocalBanner) => void;
  onDelete: (banner: LocalBanner) => void;
}

export const BannerCard = ({
  banner,
  isPending,
  isSaving,
  isDeleteDisabled,
  getImgSrc,
  onEdit,
  onPublish,
  onDelete,
}: BannerCardProps) => {
  const thumbSrc = getImgSrc(banner.image_url?.[0]);

  return (
    <div className="bg-white rounded-xl">
      <div className="relative aspect-[21/9] bg-slate-50">
        {thumbSrc ? (
          <Image
            src={thumbSrc}
            alt={banner.meta_title || "Banner"}
            fill
            className="object-cover rounded-[12px_12px_0_0]"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageOff className="text-slate-200" size={28} />
          </div>
        )}
        <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur text-white text-[10px] px-3 py-1 rounded-full font-black">
          POS: {banner.position}
        </div>
        <div
          className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black shadow-sm uppercase tracking-widest ${
            banner.status === "active"
              ? "bg-emerald-500 text-white"
              : "bg-white text-slate-600"
          }`}
        >
          {banner.status}
        </div>
        {isPending && (
          <div className="absolute bottom-0 inset-x-0 bg-amber-400 text-[9px] text-amber-950 font-black text-center py-1 uppercase tracking-widest">
            Unpublished changes
          </div>
        )}
      </div>
      <div className="p-5 flex justify-between items-center gap-2">
        <button
          onClick={() => onEdit(banner)}
          className="flex items-center gap-2 bg-[#F9F9F9] w-full justify-center text-base text-black cursor-pointer rounded-[8px] py-2"
        >
          <SquarePen size={16} /> Edit Details
        </button>
        <div className="flex gap-2">
          {isPending && (
            <button
              onClick={() => onPublish(banner)}
              disabled={isSaving}
              className="bg-emerald-500 text-white p-2.5 rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Publish changes"
            >
              {isSaving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <CheckCircle2 size={18} />
              )}
            </button>
          )}
          <button
            onClick={() => onDelete(banner)}
            disabled={isDeleteDisabled}
            className="text-black rounded-[8px] bg-[#F9F9F9] hover:text-red-500 p-2.5 transition-colors disabled:opacity-50 cursor-pointer"
            title="Delete banner"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
