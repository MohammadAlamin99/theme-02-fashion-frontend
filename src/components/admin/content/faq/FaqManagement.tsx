"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { PlusCircle, Loader2 } from "lucide-react";
import {
  createFaq,
  updateFaq,
  deleteFaq,
  Faq,
  getFaqsAdmin,
} from "@/services-api/faqService";
import FaqItem from "./Faqitem";
import FaqModal, { FAQFormData } from "./Faqmodal";
import PrimaryButton from "../../common/PrimaryButton";

const FaqManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FAQFormData>({
    question: "",
    answer: "",
    priority: 1,
    status: "active",
  });

  // --- Fetch Data ---
  const { data: faqs = [], isLoading } = useQuery<Faq[], Error>({
    queryKey: ["faqs"],
    queryFn: async () => {
      const response = await getFaqsAdmin();
      return response.data;
    },
  });
  // --- Logic: Sort by Priority (Descending) ---
  const sortedFaqs = [...faqs].sort(
    (a, b) => (b.priority ?? 0) - (a.priority ?? 0),
  );

  // --- Mutations ---
  const createMutation = useMutation({
    mutationFn: createFaq,
    onSuccess: (success) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ["faqs"] });
        toast.success("FAQ Created");
        closeModal();
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Faq> }) =>
      updateFaq(id, data),
    onSuccess: (success) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ["faqs"] });
        toast.success("FAQ Updated");
        closeModal();
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFaq,
    onSuccess: (success) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ["faqs"] });
        toast.success("FAQ Deleted");
      }
    },
  });

  // --- Handlers ---
  const openModal = (faq?: Faq) => {
    if (faq) {
      setEditingId(faq.id);
      setFormData({
        question: faq.question,
        answer: faq.answer,
        priority: faq.priority ?? 1,
        status: faq.status,
      });
    } else {
      setEditingId(null);
      const maxPriority =
        faqs.length > 0 ? Math.max(...faqs.map((f) => f.priority ?? 0)) : 0;
      setFormData({
        question: "",
        answer: "",
        priority: maxPriority + 1,
        status: "active",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleToggleExpand = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  const handleSave = () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error("Fields cannot be empty");
      return;
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading)
    return (
      <div className="p-20 text-center">
        <Loader2 className="animate-spin mx-auto text-indigo-500" />
      </div>
    );

  return (
    <div className="p-4 font-lato">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-xl font-bold text-[#023337] uppercase">
            FAQ Management
          </h1>
          <p className="text-[#59D38E] text-base font-bold mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#59D38E]" />
            Active Records: {faqs.length}
          </p>
        </div>

        <PrimaryButton
          label="ADD NEW QUESTION"
          onClick={() => openModal()}
          icon={<PlusCircle size={20} />}
        />
      </header>

      {/* List */}
      <div className="space-y-6">
        {sortedFaqs.map((faq, index) => (
          <FaqItem
            key={faq.id}
            faq={faq}
            index={index}
            isExpanded={expandedId === faq.id}
            onToggle={handleToggleExpand}
            onEdit={openModal}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <FaqModal
          isEditing={!!editingId}
          formData={formData}
          isSaving={createMutation.isPending || updateMutation.isPending}
          onChange={setFormData}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default FaqManagement;
