"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { MoreVertical, Trash2, Edit3, Loader2 } from "lucide-react";
import { fetchAllBrands, deleteBrand } from "@/services-api/brandService";
import DataTable from "../../common/DataTable";
import Pagination from "../../common/Pagination";

interface TableColumn<T> {
  header: string;
  key: string;
  render?: (item: T, index: number) => React.ReactNode;
  headerRender?: () => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export default function BrandTable() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL parameters for live active filtering sync
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const baseStorageUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  const { data: serverPayload, isLoading } = useQuery({
    queryKey: ["catalog-brands-list", page, limit, search, status],
    queryFn: () => {
      let mappedStatus = "";
      if (status === "PUBLISHED") mappedStatus = "active";
      if (status === "DRAFT") mappedStatus = "draft";
      return fetchAllBrands({ page, limit, search, status: mappedStatus });
    },

    staleTime: 0,
    refetchOnMount: true,
  });

  const brandList = serverPayload?.data || [];
  const meta = serverPayload?.meta || { totalPages: 1, total: 0 };

  // DELETE MUTATION WORKFLOW
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog-brands-list"] });
      alert("Brand removed successfully from database rows.");
      setActiveMenuId(null);
    },
    onError: (err: any) => alert(err.message),
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
    if (selectedIds.length === brandList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(brandList.map((item: any) => item.id));
    }
  };

  // 🚀 FIXED: Added absolute string literals to className and headerClassName definitions to prevent runtime loop extraction errors
  const columns: TableColumn<any>[] = [
    {
      header: "",
      key: "checkbox-selection",
      className: "px-4 py-3 align-middle",
      headerClassName: "w-[45px] px-4 py-3 text-left",
      headerRender: () => (
        <input
          type="checkbox"
          className="w-5 h-5 rounded border-[#023337]/30 accent-[#1DA1F2] cursor-pointer"
          checked={
            selectedIds.length === brandList.length && brandList.length > 0
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
      header: "SL",
      key: "sl",
      className: "px-4 py-3 align-middle",
      headerClassName: "px-4 py-3 text-left",
      render: (_, index) => (
        <span className="text-[15px] text-[#1D1A1A] font-normal">
          {(page - 1) * limit + (index ?? 0) + 1}
        </span>
      ),
    },
    // Inside BrandTable.tsx, update the Image column
    {
      header: "Image/icon",
      key: "image",
      render: (item) => {
        const rawImg = item.logo_url;
        const cleanImg = typeof rawImg === "string" ? rawImg.trim() : "";
        const isValidImg = cleanImg.replace(/^\/+/, "").length > 0;

        const baseUrl = isValidImg
          ? cleanImg.startsWith("http")
            ? cleanImg
            : `${baseStorageUrl}/${cleanImg.replace(/^\/+/, "")}`
          : "/images/products/product2.png";

        const srcUrl = isValidImg ? `${baseUrl}?t=${Date.now()}` : baseUrl;

        return (
          <img
            src={srcUrl}
            key={srcUrl} // KEY + srcUrl forces React to re-render when the image changes
            alt={item.name}
            className="rounded-[8px] object-cover h-11 w-11 bg-gray-50"
          />
        );
      },
    },
    {
      header: "Brand Name",
      key: "brandName",
      className: "px-4 py-3 align-middle",
      headerClassName: "px-4 py-3 text-left",
      render: (item) => (
        <span className="text-[15px] text-[#1D1A1A] font-medium text-black">
          {item.name || "Unnamed Brand"}
        </span>
      ),
    },
    {
      header: "Products",
      key: "products",
      className: "px-4 py-3 align-middle",
      headerClassName: "px-4 py-3 text-left",
      render: (item) => (
        <span className="text-[13px] xl:text-[15px] text-black font-normal">
          {item._count?.products ?? item.products ?? 0}
        </span>
      ),
    },
    {
      header: "Priority",
      key: "priority",
      className: "px-4 py-3 align-middle",
      headerClassName: "px-4 py-3 text-left",
      render: (item) => (
        <span className="text-[13px] xl:text-[15px] text-black font-normal">
          {item.priority ?? 0}
        </span>
      ),
    },
    {
      header: "Status",
      key: "status",
      className: "px-4 py-3 align-middle",
      headerClassName: "px-4 py-3 text-left",
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
                : "bg-[#FFE2C1] text-[#A65E00]"
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
      className: "px-4 py-3 align-middle text-right",
      headerClassName: "px-4 py-3 text-right",
      render: (item) => (
        <div className="relative inline-block text-left">
          <button
            onClick={() =>
              setActiveMenuId(activeMenuId === item.id ? null : item.id)
            }
            className="text-black p-1 transition-colors cursor-pointer"
          >
            <MoreVertical size={20} />
          </button>

          {activeMenuId === item.id && (
            <div className="absolute right-0 mt-1 w-32 bg-white border rounded-md shadow-lg py-1 z-50 text-left">
              <button
                type="button"
                onClick={() =>
                  router.push(`/admin/dashboard/brand/add?id=${item.id}`)
                }
                className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
              >
                <Edit3 size={12} /> Edit Brand
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Delete this brand record permanently?"))
                    deleteMutation.mutate(item.id);
                }}
                className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium"
              >
                <Trash2 size={12} /> Delete Brand
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
          Synchronizing global brand catalog entries...
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white font-poppins">
      <DataTable
        data={brandList}
        columns={columns}
        rowKey="id"
        gradiant={true}
      />

      {brandList.length > 0 && (
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
