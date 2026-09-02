"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MoreVertical,
  Trash2,
  Edit3,
  Clock,
  ChevronRight,
  Loader2,
  ChevronLeft,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";
import DataTable from "../common/DataTable";
import Image from "next/image";
import toast from "react-hot-toast";

interface Column<T> {
  header: string;
  key: string;
  render: (item: T) => React.ReactNode;
}

type AdminItem = {
  id: string;
  name: string;
  role: string;
  last_login: string;
  created_at: string;
  status: string;
  avatar: string;
  index: number;
};

// 🚀 Safe transparent fallback SVG from your working file
const FALLBACK_AVATAR =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='45' height='45' viewBox='0 0 45 45'><rect width='45' height='45' fill='%23F3F4F6'/><circle cx='22.5' cy='18' r='7' fill='%239CA3AF'/><path d='M10,38 C10,30 16,26 22.5,26 C29,26 35,30 35,38' fill='%239CA3AF'/></svg>";

export default function AdminControlTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isStatusSubMenuOpen, setIsStatusSubMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({
    top: 0,
    left: 0,
    opensUpward: false,
  });
  // Derive Backend URL exactly as you did in CustomerTable
  const baseApiUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8082/api/v1";
  const BACKEND_URL = baseApiUrl.replace("/api/v1", "");

  // Modern Date Formatting Helper
  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "N/A") return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const { data, isLoading } = useQuery({
    queryKey: ["admin-staff", searchParams.toString()],
    queryFn: async () => {
      const res = await apiFetch(
        `/users/admin/staff?${searchParams.toString()}`,
      );
      return res.json();
    },
  });

  const handleStatusUpdate = async (
    id: string,
    uiStatus: "PUBLISH" | "DRAFT",
  ) => {
    const backendStatus = uiStatus === "PUBLISH" ? "active" : "blocked";
    try {
      const res = await apiFetch(`/users/admin-update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: backendStatus }),
      });

      if (res.ok) {
        await queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
        setActiveMenuId(null);
        setIsStatusSubMenuOpen(false);
        toast.success("Status updated successfully");
      }
    } catch {
      toast.error("Network error updating status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this admin?")) return;
    const res = await apiFetch(`/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
      setActiveMenuId(null);
      toast.success("Admin deleted successfully");
    } else {
      toast.error("Network error deleting admin");
    }
  };

  const columns: Column<AdminItem>[] = [
    {
      header: "SL",
      key: "sl",
      render: (item: AdminItem, i?: number) => (i !== undefined ? i + 1 : 1),
    },
    {
      header: "Picture",
      key: "picture",
      render: (item: { avatar: string }) => {
        // EXACT IMAGE LOGIC FROM YOUR CUSTOMERTABLE
        let finalAvatar = FALLBACK_AVATAR;

        if (item.avatar && item.avatar.trim() !== "") {
          if (
            item.avatar.startsWith("http") ||
            item.avatar.startsWith("data:")
          ) {
            finalAvatar = item.avatar;
          } else {
            const cleanPath = item.avatar.startsWith("/")
              ? item.avatar
              : `/${item.avatar}`;
            finalAvatar = `${BACKEND_URL}${cleanPath}`;
          }
        }

        return (
          <Image
            src={finalAvatar}
            width={10}
            height={10}
            unoptimized
            className="w-10 h-10 rounded-full object-cover"
            alt="admin"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              if (el.src !== FALLBACK_AVATAR) {
                el.src = FALLBACK_AVATAR;
              }
            }}
          />
        );
      },
    },
    {
      header: "Name",
      key: "name",
      render: (item: { name: string }) => item.name,
    },
    {
      header: "Role",
      key: "role",
      render: (item: { role: string }) => item.role,
    },
    {
      header: "Last Login",
      key: "last_login",
      render: (item: { last_login: string }) => formatDate(item.last_login),
    },
    {
      header: "Registration At",
      key: "created_at",
      render: (item: { created_at: string }) => formatDate(item.created_at),
    },
    {
      header: "Status",
      key: "status",
      render: (item: { status: string }) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            item.status === "active"
              ? "bg-[#C1FFBC] text-[#085E00]"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {item.status === "active" ? "Publish" : "Draft"}
        </span>
      ),
    },
    {
      header: "Action",
      key: "action",
      render: (item) => (
        <div className="relative flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              const windowHeight = window.innerHeight;
              const menuHeight = 150;
              const opensUpward = windowHeight - rect.bottom < menuHeight;

              setMenuPos({
                top: opensUpward ? rect.top - 145 : rect.bottom,
                left: rect.left - 170,
                opensUpward,
              });

              setActiveMenuId(activeMenuId === item.id ? null : item.id);
              setIsStatusSubMenuOpen(false);
            }}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <MoreVertical size={18} className="text-gray-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white py-4 rounded-lg relative">
      {isLoading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <DataTable
          data={data?.data?.data || []}
          columns={columns}
          rowKey="id"
        />
      )}

      {/* 🚀 FIXED: Global Fixed Action Menu UI for Admin Control */}
      {activeMenuId && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => {
              setActiveMenuId(null);
              setIsStatusSubMenuOpen(false);
            }}
          />

          <div
            className="fixed bg-white border border-gray-100 shadow-2xl rounded-xl py-1 z-[9999] w-48 animate-in fade-in zoom-in duration-100"
            style={{
              top: menuPos.top,
              left: menuPos.left,
              minHeight: "80px",
            }}
          >
            <button
              onClick={() => {
                router.push(
                  `/admin/dashboard/admin-control/edit/${activeMenuId}`,
                );
                setActiveMenuId(null);
              }}
              className="w-full px-4 py-2.5 text-[13px] flex items-center gap-3 hover:bg-gray-50 font-medium text-gray-700 cursor-pointer"
            >
              <Edit3 size={14} /> Edit
            </button>

            <div
              className="relative w-full"
              onMouseEnter={() => setIsStatusSubMenuOpen(true)}
            >
              <button className="w-full px-4 py-2.5 text-[13px] flex items-center justify-between hover:bg-gray-50 font-medium text-gray-700 cursor-pointer border-t border-gray-50">
                <span className="flex items-center gap-3">
                  <Clock size={14} /> Status
                </span>
                <ChevronLeft size={14} />
              </button>

              {isStatusSubMenuOpen && (
                <div className="absolute right-full top-0 mr-1 w-32 bg-white border border-gray-100 shadow-2xl rounded-xl py-1 z-[10000]">
                  <button
                    onClick={() => handleStatusUpdate(activeMenuId, "PUBLISH")}
                    className="w-full px-4 py-2 text-xs hover:bg-gray-50 text-left cursor-pointer"
                  >
                    Publish
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(activeMenuId, "DRAFT")}
                    className="w-full px-4 py-2 text-xs hover:bg-gray-50 text-left cursor-pointer border-t border-gray-50"
                  >
                    Draft
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => handleDelete(activeMenuId)}
              className="w-full px-4 py-2.5 text-[13px] flex items-center gap-3 text-red-600 hover:bg-red-50 font-medium cursor-pointer border-t border-gray-50"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
