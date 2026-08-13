"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { MoreVertical, Trash2, Edit3, Loader2 } from "lucide-react";
import { fetchAllUnits, deleteUnit } from "@/services-api/unitService";
import DataTable from "../../common/DataTable";
import Pagination from "../../common/Pagination";

type UnitRow = {
  id: string;
  name: string;
  priority: string;
  status: string;
};

export default function UnitTable() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const page = Number(searchParams.get("page")) || 1;
  const { data: response, isLoading } = useQuery({
    queryKey: ["units-list", page],
    queryFn: () => fetchAllUnits({ page, limit: 10 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units-list"] });
      setActiveMenuId(null);
    },
  });

  const columns: {
    header: string;
    key: string;
    render?: (item: UnitRow, index: number) => React.ReactNode;
    className?: string;
    headerClassName?: string;
  }[] = [
    {
      header: "SL",
      key: "sl",
      render: (_item: UnitRow, i: number) => (page - 1) * 10 + i + 1,
    },
    {
      header: "Unit Name",
      key: "name",
      render: (item: UnitRow) => (
        <span className="font-medium text-[#1D1A1A]">{item.name}</span>
      ),
    },
    {
      header: "Priority",
      key: "priority",
      render: (item: UnitRow) => item.priority,
    },
    {
      header: "Status",
      key: "status",
      render: (item: UnitRow) => (
        <span
          className={`px-3 py-1 rounded-full text-[12px] font-medium ${item.status === "active" ? "bg-[#C1FFBC] text-[#085E00]" : "bg-gray-100 text-gray-500"}`}
        >
          {item.status === "active" ? "Publish" : "Draft"}
        </span>
      ),
    },
    {
      header: "Action",
      key: "action",
      render: (item: UnitRow) => (
        <div className="relative flex justify-end">
          <button
            onClick={() =>
              setActiveMenuId(activeMenuId === item.id ? null : item.id)
            }
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MoreVertical size={18} className="text-gray-600" />
          </button>
          {activeMenuId === item.id && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setActiveMenuId(null)}
              />
              <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-100 shadow-2xl rounded-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={() => {
                    router.push(`/admin/dashboard/unit/add?id=${item.id}`);
                    setActiveMenuId(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit3 size={14} className="text-[#1DA1F2]" /> Edit Unit
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this unit?"))
                      deleteMutation.mutate(item.id);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} /> Delete Unit
                </button>
              </div>
            </>
          )}
        </div>
      ),
    },
  ];

  if (isLoading)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="bg-white rounded-lg border border-gray-100 overflow-visible">
      <DataTable<UnitRow>
        data={Array.isArray(response?.data?.data) ? response.data.data : []}
        columns={columns}
        rowKey="id"
      />
      <div className="py-4 px-6 border-t border-gray-100">
        <Pagination
          currentPage={page}
          totalPages={response?.data?.meta?.totalPages || 1}
          onPageChange={(p) => router.push(`?page=${p}`)}
        />
      </div>
    </div>
  );
}
