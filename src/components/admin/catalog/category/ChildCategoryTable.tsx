"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { MoreVertical, Trash2, Edit3, Loader2 } from "lucide-react";
import { deleteCategory } from "@/services-api/categoryService";
import { fetchAllChildCategories } from "@/services-api/childcategoryService";
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

export default function ChildCategoryTable() {
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

  // 🚀 FETCH WORKFLOW: Synchronize third-tier child levels cleanly from query boundaries
  const { data: serverPayload, isLoading } = useQuery({
    queryKey: ["catalog-childcategories-list", page, limit, search, status],
    queryFn: () => {
      let mappedStatus = "";
      if (status === "PUBLISHED") mappedStatus = "active";
      if (status === "DRAFT") mappedStatus = "draft";

      return fetchAllChildCategories({ page, limit, search, status: mappedStatus });
    },
  });

  const childCategoryList = serverPayload?.data || [];
  const meta = serverPayload?.meta || { totalPages: 1, total: 0 };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog-childcategories-list"] });
      alert("Child category deleted successfully.");
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
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === childCategoryList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(childCategoryList.map((item: any) => item.id));
    }
  };

  const columns: TableColumn<any>[] = [
    {
      header: "",
      key: "checkbox-selection",
      headerClassName: "w-[45px]",
      headerRender: () => (
        <input
          type="checkbox"
          className="w-5 h-5 rounded border-[#023337]/30 accent-[#1DA1F2] cursor-pointer"
          checked={selectedIds.length === childCategoryList.length && childCategoryList.length > 0}
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
      header: "Parent Sub Category",
      key: "parentSubCategory",
      render: (item) => (
        <span className="text-[15px] text-[#1D1A1A] font-medium text-sky-600">
          {item.parent?.name || "Sub Category Link Missing"}
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
        const isPublished = item.status === "PUBLISHED" || item.status === "active" || item.status === "Publish";
        return (
          <div
            className={`px-3 py-1 rounded-full text-[12px] font-medium w-fit ${
              isPublished ? "bg-[#C1FFBC] text-[#085E00]" : "bg-gray-100 text-gray-500"
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
            onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)} 
            className="text-black p-1 cursor-pointer"
          >
            <MoreVertical size={20} />
          </button>
          
          {activeMenuId === item.id && (
            <div className="absolute right-0 mt-1 w-32 bg-white border rounded-md shadow-lg py-1 z-50">
              <button
                type="button"
                onClick={() => router.push(`/admin/dashboard/child-category/add?id=${item.id}`)}
                className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
              >
                <Edit3 size={12} /> Edit Child
              </button>
              <button
                type="button"
                onClick={() => { if (confirm("Delete this child category permanently?")) deleteMutation.mutate(item.id); }}
                className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium"
              >
                <Trash2 size={12} /> Delete Child
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
        <span className="text-xs">Synchronizing child categories dataset...</span>
      </div>
    );
  }

  return (
    <div className="bg-white font-poppins">
      <DataTable
        data={childCategoryList}
        columns={columns}
        rowKey="id"
        gradiant={true}
      />

      {childCategoryList.length > 0 && (
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