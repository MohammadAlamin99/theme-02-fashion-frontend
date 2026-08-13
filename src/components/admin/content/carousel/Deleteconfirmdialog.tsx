"use client";

import { AlertTriangle } from "lucide-react";
import { LocalBanner } from "./caurousel.typ";

interface DeleteConfirmDialogProps {
  banner: LocalBanner | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmDialog = ({
  banner,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteConfirmDialogProps) => {
  if (!banner) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 font-lato"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-8 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-5">
          <AlertTriangle size={26} />
        </div>
        <h3 className="text-lg font-black text-slate-800">
          Delete this banner?
        </h3>
        <p className="text-sm text-slate-400 mt-2">
          This removes it permanently from the server. This action cannot be
          undone.
        </p>
        <div className="flex gap-3 mt-7">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 font-black text-slate-500 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer text-base"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black cursor-pointer text-base transition-colors disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};
