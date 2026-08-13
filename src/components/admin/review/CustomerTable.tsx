"use client";

import React, { useState } from "react";
import { MoreVertical, UserCheck, Ban } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "@/services-api/customerService";
import DataTable from "../common/DataTable";
import Pagination from "../common/Pagination";
import Image from "next/image";

interface TableColumn<T> {
  header: string;
  key: string;
  render?: (item: T, index: number) => React.ReactNode;
  headerRender?: () => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface CustomerItem {
  id: string;
  sl: number;
  avatar: string;
  name: string;
  phone: string;
  email: string;
  status: "active" | "inactive" | "blocked";
  success_score: number;
}

// 🚀 Safe transparent fallback string to break infinite onError request loops
const FALLBACK_AVATAR =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='45' height='45' viewBox='0 0 45 45'><rect width='45' height='45' fill='%23F3F4F6'/><circle cx='22.5' cy='18' r='7' fill='%239CA3AF'/><path d='M10,38 C10,30 16,26 22.5,26 C29,26 35,30 35,38' fill='%239CA3AF'/></svg>";

export default function CustomerTable() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const cPage = Number(searchParams.get("c_page")) || 1;
  const cSearch = searchParams.get("c_search") || "";
   const cSort = searchParams.get("c_sort") || "desc";

  const { data: serverPayload } = useQuery({
    // 2. Add cSort to the queryKey so it refreshes when the button is clicked
    queryKey: ["admin-users-list", cPage, cSearch, cSort], 
    queryFn: async () => {
      try {
        // 3. Pass the sort parameter to your API service
        const res = await customerApi.getAll(cPage, 5, cSearch, cSort);
        return res;
      } catch (err) {
        console.error("❌ CUSTOMER FETCH NETWORK FAULT:", err);
        throw err;
      }
    },
  });

  console.log(serverPayload);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      customerApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users-list"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-customer-review-stats"],
      });
      setActiveMenuId(null);
    },
  });

  const rawUsers =
    serverPayload?.data && Array.isArray(serverPayload.data.data)
      ? serverPayload.data.data
      : [];

  const meta = serverPayload?.data?.meta || { totalPages: 1 };

  const baseApiUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8082/api/v1";
  const BACKEND_URL = baseApiUrl.replace("/api/v1", "");

  const customerData: CustomerItem[] = rawUsers.map(
    (user: CustomerItem, index: number) => {
      let finalAvatar = FALLBACK_AVATAR;

      if (user.avatar && user.avatar.trim() !== "") {
        if (user.avatar.startsWith("http") || user.avatar.startsWith("data:")) {
          finalAvatar = user.avatar;
        } else {
          const cleanPath = user.avatar.startsWith("/")
            ? user.avatar
            : `/${user.avatar}`;
          finalAvatar = `${BACKEND_URL}${cleanPath}`;
        }
      }

      return {
        id: user.id,
        sl: (cPage - 1) * 5 + index + 1,
        avatar: finalAvatar,
        name: user.name,
        phone: user.phone,
        email: user.email,
        status: user.status,
        success_score: user.success_score,
      };
    },
  );

  // const handleSelectRow = (id: string) => {
  //   setSelectedIds((prev) =>
  //     prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
  //   );
  // };

  // const handleSelectAll = () => {
  //   if (selectedIds.length === customerData.length) {
  //     setSelectedIds([]);
  //   } else {
  //     setSelectedIds(customerData.map((item) => item.id));
  //   }
  // };

  const columns: TableColumn<CustomerItem>[] = [
    // {
    //   header: "",
    //   key: "checkbox-selection",
    //   headerClassName: "w-[45px]",
    //   headerRender: () => (
    //     <input
    //       type="checkbox"
    //       className="w-5 h-5 rounded border-[#023337]/30 accent-[#1DA1F2] cursor-pointer"
    //       checked={
    //         selectedIds.length === customerData.length &&
    //         customerData.length > 0
    //       }
    //       onChange={handleSelectAll}
    //     />
    //   ),
    //   render: (item) => (
    //     <input
    //       type="checkbox"
    //       className="w-4 h-4 rounded border-[#EAF8E7] accent-[#1DA1F2] cursor-pointer"
    //       checked={selectedIds.includes(item.id)}
    //       onChange={() => handleSelectRow(item.id)}
    //     />
    //   ),
    // },
    {
      header: "SL",
      key: "sl",
      render: (item) => (
        <span className="text-[15px] text-[#1D1A1A] font-normal">
          {item.sl}
        </span>
      ),
    },
    {
      header: "Image",
      key: "image",
      render: (item) => (
        <div className="flex items-center">
          <Image
            src={item.avatar}
            alt={item.name}
            width={45}
            height={45}
            className="rounded-[8px] object-cover w-[45px] h-[45px] bg-gray-50"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              if (el.src !== FALLBACK_AVATAR) {
                el.src = FALLBACK_AVATAR; // Break the cycle immediately
              }
            }}
            unoptimized
          />
        </div>
      ),
    },
    {
      header: "Name",
      key: "name",
      render: (item) => (
        <span className="text-[15px] text-[#1D1A1A] font-normal block max-w-[180px] truncate">
          {item.name}
        </span>
      ),
    },
    {
      header: "Contact",
      key: "contact",
      render: (item) => (
        <div className="flex flex-col text-[14px] text-black font-normal">
          <span>{item.phone}</span>
          <span className="text-gray-500 text-[13px]">{item.email}</span>
        </div>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: (item) => {
        let badgeClass = "bg-[#C1FFBC] text-[#085E00]";
        if (item.status === "inactive")
          badgeClass = "bg-[#D4D2FF] text-[#583FC7]";
        if (item.status === "blocked")
          badgeClass = "bg-[#FFE1E1] text-[#DA0000]";

        return (
          <div
            className={`px-3 py-1 rounded-full text-[12px] font-medium w-fit capitalize ${badgeClass}`}
          >
            {item.status}
          </div>
        );
      },
    },
    {
      header: "Success Rate",
      key: "successRate",
      render: (item) => (
        <span className="text-[15px] text-[#1D1A1A] font-normal">
          {item.success_score}
        </span>
      ),
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
            className="cursor-pointer text-black p-1 transition-colors"
          >
            <MoreVertical size={20} />
          </button>
          {activeMenuId === item.id && (
            <div className="absolute cursor-pointer right-0 mt-1 w-40 bg-white border border-gray-200 rounded-[8px] shadow-lg py-1 z-50 text-xs text-black">
              {item.status !== "active" && (
                <button
                  onClick={() =>
                    updateStatusMutation.mutate({
                      id: item.id,
                      status: "active",
                    })
                  }
                  className="w-full cursor-pointer text-left px-3 py-2 text-emerald-600 hover:bg-gray-50 flex items-center gap-1.5"
                >
                  <UserCheck size={14} /> Activate Profile
                </button>
              )}
              {item.status !== "blocked" && (
                <button
                  onClick={() =>
                    updateStatusMutation.mutate({
                      id: item.id,
                      status: "blocked",
                    })
                  }
                  className="w-full cursor-pointer text-left px-3 py-2 text-rose-600 hover:bg-gray-50 flex items-center gap-1.5"
                >
                  <Ban size={14} /> Block User
                </button>
              )}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white font-poppins">
      <DataTable
        data={customerData}
        columns={columns}
        rowKey="id"
        gradiant={true}
      />
      <div className="py-5">
        <Pagination
          currentPage={cPage}
          totalPages={meta.totalPages}
          onPageChange={(pageNumber) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("c_page", String(pageNumber));
            router.push(`${pathname}?${params.toString()}`);
          }}
        />
      </div>
    </div>
  );
}
