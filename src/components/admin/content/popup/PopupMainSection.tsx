"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  PlusCircle,
  Trash2,
  CheckCircle,
  MoreVertical,
  Edit,
} from "lucide-react";
import PrimaryButton from "../../common/PrimaryButton";
import DataTable from "../../common/DataTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPopupBanners,
  createPopupBanner,
  updatePopupBanner,
  deletePopupBanner,
  uploadPopupImage,
  PopupBanner,
} from "@/services-api/popupBannerService";
import { toast } from "react-hot-toast";
import BannerFormModal from "./BannerFormModal";

interface TableColumn<T> {
  header: string;
  key: string;
  render?: (item: T, index: number) => React.ReactNode;
  headerRender?: () => React.ReactNode;
  className?: string;
  headerClassName?: string;
}
export default function PopupMainSection() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [showOnce, setShowOnce] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [menuPos, setMenuPos] = useState({
    top: 0,
    left: 0,
    opensUpward: false,
  });

  const { data: popupsData = [] } = useQuery({
    queryKey: ["popup-banners"],
    queryFn: fetchPopupBanners,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Image is required");
      const imageUrl = await uploadPopupImage(file);
      return createPopupBanner({
        image_url: imageUrl,
        link_url: linkUrl,
        show_once: showOnce,
        is_active: isActive,
      });
    },
    onSuccess: () => {
      toast.success("Popup banner created successfully!");
      queryClient.invalidateQueries({ queryKey: ["popup-banners"] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: unknown) => {
      toast.error(
        (error as { message: string }).message || "Failed to create popup",
      );
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      updatePopupBanner(id, { is_active }),
    onSuccess: () => {
      toast.success("Status updated!");
      queryClient.invalidateQueries({ queryKey: ["popup-banners"] });
    },
    onError: () => toast.error("Failed to update status"),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePopupBanner,
    onSuccess: () => {
      toast.success("Banner deleted!");
      queryClient.invalidateQueries({ queryKey: ["popup-banners"] });
    },
    onError: () => toast.error("Failed to delete banner"),
  });

  const editMutation = useMutation({
    mutationFn: async () => {
      let imageUrl = "";
      if (file) {
        imageUrl = await uploadPopupImage(file);
      } else if (editingId) {
        const existingBanner = popupsData.find((b) => b.id === editingId);
        imageUrl = existingBanner?.image_url || "";
      }

      return updatePopupBanner(editingId!, {
        image_url: imageUrl,
        link_url: linkUrl,
        show_once: showOnce,
        is_active: isActive,
      });
    },
    onSuccess: () => {
      toast.success("Popup banner updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["popup-banners"] });
      setIsEditModalOpen(false);
      resetForm();
      setEditingId(null);
    },
    onError: (error: unknown) => {
      toast.error(
        (error as { message: string }).message || "Failed to update popup",
      );
    },
  });

  const handleEditClick = (banner: PopupBanner) => {
    setEditingId(banner.id);
    setLinkUrl(banner.link_url || "");
    setShowOnce(banner.show_once);
    setIsActive(banner.is_active);
    const existingImageUrl = banner.image_url?.startsWith("http")
      ? banner.image_url
      : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") || process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8082"}${banner.image_url?.startsWith("/") ? "" : "/"}${banner.image_url}`;

    setPreview(existingImageUrl);
    setFile(null);
    setIsEditModalOpen(true);
    setOpenDropdownId(null);
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setLinkUrl("");
    setShowOnce(true);
    setIsActive(true);
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === popupsData.length && popupsData.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(popupsData.map((item) => item.id));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select an image");
      return;
    }
    createMutation.mutate();
  };

  const columns: TableColumn<PopupBanner>[] = [
    {
      header: "",
      key: "checkbox-selection",
      headerClassName: "w-[45px]",
      headerRender: () => (
        <input
          type="checkbox"
          className="w-5 h-5 rounded border-[#023337]/30 accent-[#1DA1F2] cursor-pointer"
          checked={
            selectedIds.length === popupsData.length && popupsData.length > 0
          }
          onChange={handleSelectAll}
        />
      ),
      render: (item) => (
        <input
          type="checkbox"
          className="w-4 h-4 rounded border-[#EAF8E7] accent-[#1DA1F2] cursor-pointer"
          checked={selectedIds.includes(item.id)}
          onChange={() => handleSelectRow(item.id)}
        />
      ),
    },
    {
      header: "Image",
      key: "image",
      render: (item) => (
        <div className="flex items-center gap-3 max-w-[260px]">
          <div className="shrink-0">
            <Image
              src={
                item.image_url?.startsWith("http")
                  ? item.image_url
                  : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") || process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8082"}${item.image_url?.startsWith("/") ? "" : "/"}${item.image_url}`
              }
              alt="Banner"
              width={60}
              height={60}
              className="rounded-[8px] object-cover"
            />
          </div>
        </div>
      ),
    },
    {
      header: "Link URL",
      key: "url",
      render: (item) => (
        <span
          className="text-[14px] text-gray-500 font-normal block max-w-[150px] truncate"
          title={item.link_url}
        >
          {item.link_url || "-"}
        </span>
      ),
    },
    {
      header: "Show Once",
      key: "show_once",
      render: (item) => (
        <span className="text-[14px] text-gray-500 font-normal">
          {item.show_once ? "Yes" : "No"}
        </span>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: (item) => (
        <button
          onClick={() =>
            updateStatusMutation.mutate({
              id: item.id,
              is_active: !item.is_active,
            })
          }
          className={`px-3 py-1 rounded-full text-[12px] font-medium w-fit transition-colors cursor-pointer border-none ${
            item.is_active
              ? "bg-[#C1FFBC] text-[#085E00]"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {item.is_active ? "Active" : "Draft"}
        </button>
      ),
    },
    {
      header: "Action",
      key: "action",
      render: (item) => (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              const windowHeight = window.innerHeight;
              const menuHeight = 90; // Approx height for Edit + Delete

              const opensUpward = windowHeight - rect.bottom < menuHeight;

              setMenuPos({
                top: opensUpward ? rect.top - menuHeight : rect.bottom,
                left: rect.left - 100,
                opensUpward,
              });

              setOpenDropdownId(openDropdownId === item.id ? null : item.id);
            }}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors cursor-pointer border-none bg-transparent"
          >
            <MoreVertical size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full font-poppins relative bg-white rounded-lg">
      <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-4">
          <div>
            <h2 className="text-[#003032] text-xl font-bold font-lato">
              Popup Banners
            </h2>
            <p className="text-[#777777] text-sm mt-1 font-normal">
              Manage your store popups
            </p>
          </div>
          <div onClick={() => setIsModalOpen(true)}>
            <PrimaryButton
              label="Create Popup"
              icon={<PlusCircle size={18} strokeWidth={2.5} />}
            />
          </div>
        </div>

        <DataTable
          data={popupsData}
          columns={columns}
          rowKey="id"
          gradiant={true}
        />
      </div>

      {/* 🚀 FIXED: Global Fixed Action Menu UI for Popups */}
      {openDropdownId && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setOpenDropdownId(null)}
          />
          <div
            className="fixed bg-white rounded-md shadow-xl border border-gray-100 py-1 z-[9999] w-36 animate-in fade-in zoom-in duration-100"
            style={{
              top: menuPos.top,
              left: menuPos.left,
              minHeight: "80px", // Requested min-height
            }}
          >
            <button
              onClick={() => {
                const banner = popupsData.find((b) => b.id === openDropdownId);
                if (banner) handleEditClick(banner);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer border-none bg-transparent"
            >
              <Edit size={14} /> Edit
            </button>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to delete this banner?")) {
                  deleteMutation.mutate(openDropdownId);
                }
                setOpenDropdownId(null);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50 bg-transparent cursor-pointer"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <BannerFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={(e) => {
            e.preventDefault();
            editMutation.mutate();
          }}
          isPending={editMutation.isPending}
          preview={preview}
          linkUrl={linkUrl}
          setLinkUrl={setLinkUrl}
          showOnce={showOnce}
          setShowOnce={setShowOnce}
          isActive={isActive}
          setIsActive={setIsActive}
          handleFileChange={handleFileChange}
        />
      )}

      {/* CREATE MODAL */}
      {isModalOpen && (
        <BannerFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={onSubmit}
          isPending={createMutation.isPending}
          preview={preview}
          linkUrl={linkUrl}
          setLinkUrl={setLinkUrl}
          showOnce={showOnce}
          setShowOnce={setShowOnce}
          isActive={isActive}
          setIsActive={setIsActive}
          handleFileChange={handleFileChange}
        />
      )}
    </div>
  );
}
