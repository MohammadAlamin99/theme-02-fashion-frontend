"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { MoreVertical, Trash2, Edit3, Loader2 } from "lucide-react";
import { fetchAllTags, deleteTag } from "@/services-api/tagService";
import DataTable from "../../common/DataTable";
import Pagination from "../../common/Pagination";
import toast from "react-hot-toast";
import Image from "next/image";

interface TableColumn<T> {
  header: string;
  key: string;
  render?: (item: T, index: number) => React.ReactNode;
  headerRender?: () => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

type Tag = {
  id: string;
  name: string;
  image_url: string;
  is_flash_sale: boolean;
  products: number;
  priority: number;
  status: string;
  _count: {
    product_tags: number;
  };
};

export default function TagTable() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const baseStorageUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  // FETCH WORKFLOW: Synchronize global server tags array logs
  const { data: serverPayload, isLoading } = useQuery({
    queryKey: ["catalog-tags-list", page, limit, search, status],
    queryFn: () => {
      let mappedStatus = "";
      if (status === "PUBLISHED") mappedStatus = "active";
      if (status === "DRAFT") mappedStatus = "draft";

      return fetchAllTags({ page, limit, search, status: mappedStatus });
    },
  });

  const tagList = serverPayload?.data || [];
  const meta = serverPayload?.meta || { totalPages: 1, total: 0 };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog-tags-list"] });
      toast.success("Tag entry removed successfully from system indices.");
      setActiveMenuId(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const handlePageChange = (targetPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(targetPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === tagList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(tagList.map((item: { id: string }) => item.id));
    }
  };

  const columns: TableColumn<Tag>[] = [
    {
      header: "",
      key: "checkbox-selection",
      headerClassName: "w-[45px]",
      headerRender: () => (
        <input
          type="checkbox"
          className="w-5 h-5 rounded border-[#023337]/30 accent-[#1DA1F2] cursor-pointer"
          checked={selectedIds.length === tagList.length && tagList.length > 0}
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
      header: "SL",
      key: "sl",
      render: (_, index) => (
        <span className="text-[15px] text-[#1D1A1A] font-normal">
          {(page - 1) * limit + (index ?? 0) + 1}
        </span>
      ),
    },
    {
      header: "Image",
      key: "image",
      render: (item) => {
        const rawImg = item.image_url;
        const cleanImg = typeof rawImg === "string" ? rawImg.trim() : "";
        const isValidImg = cleanImg.replace(/^\/+/, "").length > 0;
        const srcUrl = isValidImg
          ? cleanImg.startsWith("http")
            ? cleanImg
            : `${baseStorageUrl}/${cleanImg.replace(/^\/+/, "")}`
          : "/images/products/product2.png";
        return (
          <Image
            width={100}
            height={100}
            unoptimized
            src={srcUrl}
            alt="tag image"
            className="rounded-[8px] object-cover h-10 w-10 bg-gray-50"
          />
        );
      },
    },
    {
      header: "Tag Name",
      key: "tagName",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-[15px] text-[#1D1A1A] font-medium">
            {item.name || "Unnamed Tag"}
          </span>
          {item.is_flash_sale && (
            <span className="text-[10px] text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded w-fit mt-0.5">
              Flash Sale Window
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Products",
      key: "products",
      render: (item) => (
        <span className="text-[13px] xl:text-[15px] text-black font-normal">
          {item._count?.product_tags ?? item.products ?? 0}
        </span>
      ),
    },
    {
      header: "Priority",
      key: "priority",
      render: (item) => (
        <span className="text-[13px] xl:text-[15px] text-black font-normal">
          {item.priority ?? 100}
        </span>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: (item) => {
        const isPublished =
          item.status === "PUBLISHED" ||
          item.status === "active" ||
          item.status === "Publish";
        return (
          <div
            className={`px-3 py-1 rounded-full text-[12px] font-medium w-fit ${
              isPublished
                ? "bg-[#C1FFBC] text-[#085E00]"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {isPublished ? "Publish" : "Draft"}
          </div>
        );
      },
    },
    {
      header: "Action",
      key: "action",
      render: (item) => (
        <div className="relative">
          <button
            onClick={() =>
              setActiveMenuId(activeMenuId === item.id ? null : item.id)
            }
            className="text-black p-1 transition-colors cursor-pointer"
          >
            <MoreVertical size={20} />
          </button>

          {activeMenuId === item.id && (
            <div className="absolute right-0 mt-1 w-32 bg-white border rounded-md shadow-lg py-1 z-50">
              <button
                type="button"
                onClick={() =>
                  router.push(`/admin/dashboard/tag/add?id=${item.id}`)
                }
                className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
              >
                <Edit3 size={12} /> Edit Tag
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Delete this campaign tag permanently?"))
                    deleteMutation.mutate(item.id);
                }}
                className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium"
              >
                <Trash2 size={12} /> Delete Tag
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="h-64 w-full bg-white flex flex-col items-center justify-center text-gray-400 gap-2 font-poppins">
        <Loader2 className="animate-spin text-gray-400" size={24} />
        <span className="text-xs">
          Synchronizing active catalog tags entries...
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white font-poppins">
      <DataTable data={tagList} columns={columns} rowKey="id" gradiant={true} />

      {tagList.length > 0 && (
        <div className="py-5 md:mx-10 mx-2">
          <Pagination
            currentPage={page}
            totalPages={meta.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
