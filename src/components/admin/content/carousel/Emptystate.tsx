"use client";

import { ImageOff } from "lucide-react";

export const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-100 rounded-3xl">
    <ImageOff className="text-slate-200 mb-4" size={48} />
    <p className="font-black text-slate-400 uppercase tracking-widest text-xs">
      No banners yet
    </p>
    <p className="text-slate-300 text-sm mt-1">
      Add your first hero banner to get started.
    </p>
  </div>
);
