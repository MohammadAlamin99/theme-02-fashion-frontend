
"use client";

import Image from "next/image";
import { Heart, Home, ImageOff, Search, ShoppingBag, User } from "lucide-react";
import { getBannerKey } from "./Utils";
import { LocalBanner } from "./caurousel.typ";

interface LivePreviewPhoneProps {
  localBanners: LocalBanner[];
  previewBanner: LocalBanner | null;
  getImgSrc: (path?: string | null) => string;
}

export const LivePreviewPhone = ({
  localBanners,
  previewBanner,
  getImgSrc,
}: LivePreviewPhoneProps) => {
  const heroSrc = previewBanner ? getImgSrc(previewBanner.image_url[0]) : "";

  return (
    <div className="relative mx-auto w-full bg-white">
      <div className="overflow-y-auto hide-scrollbar pb-16">
        {/* App header */}
        <div className="pt-4 pb-3 px-5 flex justify-between items-center">
          <span className="text-lg font-black italic tracking-tighter">
            Creassmart
          </span>
          <div className="flex gap-3 text-slate-400">
            <Search size={18} />
            <Heart size={18} />
          </div>
        </div>

        {/* Dynamic banner preview */}
        <div className="px-4">
          <div className="relative aspect-[16/9] bg-slate-50 rounded-2xl overflow-hidden">
            {heroSrc ? (
              <Image
                src={heroSrc}
                alt={previewBanner?.meta_title || "Hero banner"}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 gap-2">
                <ImageOff size={22} />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  No active banners
                </span>
              </div>
            )}
            {localBanners.length > 0 && (
              <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
                {localBanners.slice(0, 5).map((b, i) => (
                  <div
                    key={getBannerKey(b) || i}
                    className={`h-1 rounded-full transition-all ${
                      i === 0 ? "w-6 bg-white" : "w-2 bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mock content */}
        <div className="p-5 space-y-7 mt-2">
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2 text-center">
                <div className="aspect-square bg-slate-50 rounded-2xl border border-slate-100" />
                <div className="w-8 h-1.5 bg-slate-100 mx-auto rounded" />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div className="w-28 h-3 bg-slate-200 rounded" />
              <div className="w-10 h-2 bg-slate-100 rounded" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-36 bg-slate-50 rounded-2xl border border-slate-100" />
              <div className="h-36 bg-slate-50 rounded-2xl border border-slate-100" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom tab bar */}
      <div className="absolute bottom-0 inset-x-0 h-16 bg-white border-t border-slate-100 flex items-center justify-around px-4">
        <Home size={20} className="text-slate-900" />
        <Search size={20} className="text-slate-300" />
        <ShoppingBag size={20} className="text-slate-300" />
        <User size={20} className="text-slate-300" />
      </div>
    </div>
  );
};
