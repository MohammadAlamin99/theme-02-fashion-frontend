"use client";

import React from "react";
import { Trash2, SquarePen, ChevronDown, ChevronUp } from "lucide-react";
import { Faq } from "@/services-api/faqService";

interface FaqItemProps {
  faq: Faq;
  index: number;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onEdit: (faq: Faq) => void;
  onDelete: (id: string) => void;
}

const FaqItem: React.FC<FaqItemProps> = ({
  faq,
  index,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      className={`bg-white border border-[#EBEBEB] rounded-[12px] transition-all ${
        isExpanded ? "border-[#EBEBEB]" : ""
      }`}
    >
      <div
        className="p-4 flex justify-between items-center cursor-pointer"
        onClick={() => onToggle(faq.id)}
      >
        <div className="flex items-center gap-8 overflow-hidden">
          {/* Serial Number (Index + 1) */}
          <div className="bg-[#F8FAFC] text-slate-900 w-14 h-14 shrink-0 flex items-center justify-center rounded-2xl font-bold text-lg border border-slate-100">
            {index + 1}
          </div>
          <h3 className="font-bold text-[#001B34] text-xl tracking-tight">
            {faq.question}
          </h3>
        </div>
        <div className="flex items-center gap-6 shrink-0">
          <div
            className={`px-4 py-1 rounded-lg text-[11px] font-black tracking-widest uppercase ${
              faq.status === "active"
                ? "bg-[#E6F9EF] text-[#59D38E]"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            {faq.status}
          </div>
          <div
            className={`p-3 rounded-2xl transition-all ${
              isExpanded
                ? "bg-indigo-50 text-indigo-600"
                : "bg-slate-50 text-slate-300"
            }`}
          >
            {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-10 pb-10 pt-2 animate-in fade-in slide-in-from-top-2">
          <div className="h-[1px] bg-slate-100 mb-8 ml-20" />
          <div className="ml-20">
            <p className="text-slate-500 leading-relaxed text-lg font-medium mb-10">
              {faq.answer}
            </p>
            <div className="flex justify-end items-center gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(faq);
                }}
                className="flex items-center gap-2 px-8 py-3.5 text-[#6366F1] bg-white border border-indigo-100 hover:bg-[#6366F1] hover:text-white rounded-xl transition-all font-bold text-base cursor-pointer"
              >
                <SquarePen size={18} /> Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Remove?")) onDelete(faq.id);
                }}
                className="flex items-center gap-2 px-8 py-3.5 text-red-500 bg-white border border-rose-100 hover:bg-rose-500 hover:text-white rounded-xl transition-all font-bold text-base cursor-pointer"
              >
                <Trash2 size={18} /> Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaqItem;
