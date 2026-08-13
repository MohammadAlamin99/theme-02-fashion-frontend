"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Plus, Search } from "lucide-react";
import PrimaryButton from "../common/PrimaryButton";

export default function AdminControlHead() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for the search input to allow real-time typing
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );

  // Helper to update URL params
  const updateUrlParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); 
    router.push(`${pathname}?${params.toString()}`);
  };

  // EFFECT: Debounce Search
  // This triggers the search after the user stops typing for 500ms
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Only update if the value actually changed from the URL param
      if (searchTerm !== (searchParams.get("search") || "")) {
        updateUrlParam("search", searchTerm);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="w-full bg-white p-5 font-lato mt-2 border-b border-gray-100 mb-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h2 className="text-[#023337] text-[22px] font-bold">Admin Control</h2>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          {/* Search Input - Real Time with Debounce */}
          <div className="relative w-full md:w-[300px]">
            <input
              type="text"
              placeholder="Search Admin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#F9F9F9] border border-gray-200 rounded-[8px] pl-10 pr-4 py-3 outline-none w-full focus:border-[#1DA1F2] transition-all"
            />
            <Search
              className="absolute left-3 top-3.5 text-gray-400"
              size={18}
            />
          </div>

          {/* Status Select - Matches your lowercase DB enums */}
          <select
            value={searchParams.get("status") || ""}
            onChange={(e) => updateUrlParam("status", e.target.value)}
            className="bg-[#F9F9F9] border border-gray-200 px-4 py-3 rounded-[8px] cursor-pointer outline-none focus:border-[#1DA1F2] text-sm font-medium text-gray-700"
          >
            <option value="">All Status</option>
            <option value="active">Publish</option>
            <option value="blocked">Draft</option>
          </select>

          <PrimaryButton
            label="Add Role"
            onClick={() => router.push("/admin/dashboard/admin-control/add")}
            icon={<Plus size={20} />}
          />
        </div>
      </div>
    </div>
  );
}
