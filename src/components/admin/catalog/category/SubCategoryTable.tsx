"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { MoreVertical, Trash2, Edit3, Loader2 } from "lucide-react";
// 🚀 FIXED: Imports correctly matched from our single category service architecture layer
import {
  fetchAllSubCategories,
  deleteCategory,
} from "@/services-api/categoryService";
import DataTable from "../../common/DataTable";
import Pagination from "../../common/Pagination";
import toast from "react-hot-toast";

interface TableColumn<T> {
  header: string;
  key: string;
  render?: (item: T, index: number) => React.ReactNode;
  headerRender?: () => React.ReactNode;
  className?: string;
  headerClassName?: string;
}
type subcategories = {
  id: string;
  name: string;
  parentCategory: string;
  products: number;
  priority: number;
  status: string;
  parent?: {
    id: string;
    name: string;
  };
  _count?: {
    products: number;
  };
};

export default function SubCategoryTable() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL parameters for live active filtering sync
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const [menuPos, setMenuPos] = useState({
    top: 0,
    left: 0,
    opensUpward: false,
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // FETCH WORKFLOW: Load sub-categories using TanStack service layer hook
  const { data: serverPayload, isLoading } = useQuery({
    queryKey: ["catalog-subcategories-list", page, limit, search, status],
    queryFn: () => {
      let mappedStatus = "";
      if (status === "PUBLISHED") mappedStatus = "active";
      if (status === "DRAFT") mappedStatus = "draft";

      return fetchAllSubCategories({
        page,
        limit,
        search,
        status: mappedStatus,
      });
    },
  });

  const subCategoryList = serverPayload?.data || [];
  const meta = serverPayload?.meta || { totalPages: 1, total: 0 };

  // DELETE TRANSACTION ACTION MUTATION
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["catalog-subcategories-list"],
      });
      toast.success("Subcategory deleted successfully.");
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
    if (selectedIds.length === subCategoryList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(subCategoryList.map((item: { id: string }) => item.id));
    }
  };

  const columns: TableColumn<subcategories>[] = [
    {
      header: "",
      key: "checkbox-selection",
      headerClassName: "w-[45px]",
      headerRender: () => (
        <input
          type="checkbox"
          className="w-5 h-5 rounded border-[#023337]/30 accent-[#1DA1F2] cursor-pointer"
          checked={
            selectedIds.length === subCategoryList.length &&
            subCategoryList.length > 0
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
      render: (_, index) => (
        <span className="text-[15px] text-[#1D1A1A] font-normal">
          {(page - 1) * limit + (index ?? 0) + 1}
        </span>
      ),
    },
    {
      header: "Name",
      key: "name",
      render: (item) => (
        <span className="text-[15px] text-[#1D1A1A] font-normal block max-w-[240px]">
          {item.name}
        </span>
      ),
    },
    {
      header: "Parent Category",
      key: "parentCategory",
      render: (item) => (
        <span className="text-[15px] text-[#1D1A1A] font-medium text-sky-600">
          {item.parent?.name || "Root Category Link Missing"}
        </span>
      ),
    },
    {
      header: "Products",
      key: "products",
      render: (item) => (
        <span className="text-[13px] xl:text-[15px] text-black font-normal">
          {item._count?.products ?? 0}
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
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              const windowHeight = window.innerHeight;
              const menuHeight = 90; // Approx height for 2 items

              const opensUpward = windowHeight - rect.bottom < menuHeight;

              setMenuPos({
                top: opensUpward ? rect.top - menuHeight : rect.bottom,
                left: rect.left - 100,
                opensUpward,
              });

              setActiveMenuId(activeMenuId === item.id ? null : item.id);
            }}
            className="text-black p-1 transition-colors cursor-pointer hover:bg-gray-100 rounded-full"
          >
            <MoreVertical size={20} />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="h-64 w-full bg-white flex flex-col items-center justify-center text-gray-400 gap-2 font-poppins">
        <Loader2 className="animate-spin text-gray-400" size={24} />
        <span className="text-xs">
          Synchronizing active subcategories dataset...
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white font-poppins relative">
      <DataTable
        data={subCategoryList}
        columns={columns}
        rowKey="id"
        gradiant={true}
      />

      {subCategoryList.length > 0 && (
        <div className="py-5 md:mx-10 mx-2">
          <Pagination
            currentPage={page}
            totalPages={meta.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* 🚀 FIXED: Global Fixed Action Menu UI */}
      {activeMenuId && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setActiveMenuId(null)}
          />

          <div
            className="fixed bg-white rounded-md shadow-xl border border-gray-100 py-1 z-[9999] w-36 animate-in fade-in zoom-in duration-100"
            style={{
              top: menuPos.top,
              left: menuPos.left,
              minHeight: "80px", 
            }}
          >
            <button
              onClick={() => {
                router.push(
                  `/admin/dashboard/sub-category/add?id=${activeMenuId}`,
                );
                setActiveMenuId(null);
              }}
              className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
            >
              <Edit3 size={12} /> Edit Sub
            </button>
            <button
              onClick={() => {
                if (confirm("Delete this sub-category permanently?")) {
                  deleteMutation.mutate(activeMenuId);
                }
                setActiveMenuId(null);
              }}
              className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium border-t border-gray-50"
            >
              <Trash2 size={12} /> Delete Sub
            </button>
          </div>
        </>
      )}
    </div>
  );
}
