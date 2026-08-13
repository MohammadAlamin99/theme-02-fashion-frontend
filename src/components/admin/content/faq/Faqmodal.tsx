
"use client";

import React from "react";
import { X } from "lucide-react";
import { FAQ } from "@/services-api/faqService";

export type FAQFormData = Omit<FAQ, "id" | "createdAt" | "updatedAt">;

interface FaqModalProps {
  isEditing: boolean;
  formData: FAQFormData;
  isSaving: boolean;
  onChange: (data: FAQFormData) => void;
  onClose: () => void;
  onSave: () => void;
}

const FaqModal: React.FC<FaqModalProps> = ({
  isEditing,
  formData,
  isSaving,
  onChange,
  onClose,
  onSave,
}) => {
  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-[3rem] w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] relative">
        {/* Close Button - Banner Style */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 cursor-pointer z-10"
        >
          <X size={20} />
        </button>

        <div className="p-10 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col items-center space-y-6">
            {/* Header Text */}
            <div className="text-center space-y-1">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                {isEditing ? "Update" : "Create"} FAQ
              </h2>
              <p className="text-[12px] text-slate-400">
                Manage your frequently asked questions.
              </p>
            </div>

            {/* Input Fields - Styled exactly like Banner modal */}
            <div className="w-full space-y-4 pt-4">
              <div className="space-y-1">
                <input
                  value={formData.question}
                  onChange={(e) =>
                    onChange({ ...formData, question: e.target.value })
                  }
                  placeholder="The Question"
                  className="w-full bg-[#F8F9FA] border-none px-6 py-4 rounded-2xl outline-none text-slate-600 placeholder:text-slate-400 text-sm font-medium"
                />
              </div>

              <div className="space-y-1">
                <textarea
                  value={formData.answer}
                  onChange={(e) =>
                    onChange({ ...formData, answer: e.target.value })
                  }
                  placeholder="The Answer"
                  rows={4}
                  className="w-full bg-[#F8F9FA] border-none px-6 py-4 rounded-2xl outline-none text-slate-600 placeholder:text-slate-400 text-sm font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select
                  value={formData.status}
                  onChange={(e) =>
                    onChange({
                      ...formData,
                      status: e.target.value as "active" | "draft",
                    })
                  }
                  className="w-full bg-[#F8F9FA] border-none px-6 py-4 rounded-2xl outline-none text-slate-500 text-sm font-bold cursor-pointer appearance-none"
                >
                  <option value="active">ACTIVE</option>
                  <option value="draft">DRAFT</option>
                </select>

                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) =>
                    onChange({
                      ...formData,
                      priority: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Priority"
                  className="w-full bg-[#F8F9FA] border-none px-6 py-4 rounded-2xl outline-none text-slate-600 text-sm font-medium"
                />
              </div>
            </div>

            {/* Save Button - Styled exactly like Banner modal */}
            <div className="w-full pt-4 flex justify-start">
              <button
                onClick={onSave}
                disabled={isSaving}
                className="bg-[#F1F3F5] hover:bg-[#e9ecef] text-slate-800 px-12 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer min-w-[140px]"
              >
                {isSaving ? "SAVING..." : "SAVE"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqModal;
