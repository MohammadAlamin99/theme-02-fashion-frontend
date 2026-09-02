"use client";

import { useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import PluseIcon from "@/components/store-front/svg/svg/PluseIcon";
import PrimaryButton from "../common/PrimaryButton";
import CategoryNavigation from "./CategoryNavigation";
import { SearchIcon } from "lucide-react";

const CatalogHead = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentSearch = searchParams.get("search") || "";
  const currentStatus = searchParams.get("status") || "";

  const currentTabConfig = (() => {
    if (pathname.includes("/sub-category")) {
      return {
        label: "Add Sub Category",
        route: "/admin/dashboard/sub-category/add",
      };
    }
    if (pathname.includes("/child-category")) {
      return {
        label: "Add Child Category",
        route: "/admin/dashboard/child-category/add",
      };
    }
    if (pathname.includes("/brand")) {
      return { label: "Add Brand", route: "/admin/dashboard/brand/add" };
    }
    if (pathname.includes("/tag")) {
      return { label: "Add Tag", route: "/admin/dashboard/tag/add" };
    }
    return { label: "Add Category", route: "/admin/dashboard/category/add" };
  })();

  const updateUrlParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-full bg-white p-5 mt-2 border-b border-gray-100 font-poppins">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <h2 className="text-[#023337] text-[22px] font-bold font-lato">
          Catalog
        </h2>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full lg:w-auto">
          {/* Search Inputs */}
          <div className="bg-[#F9F9F9] rounded-lg px-4 py-3.5 flex items-center w-full md:w-[320px]">
            <SearchIcon size={24} color="black" />
            <input
              ref={searchInputRef}
              type="text"
              defaultValue={currentSearch}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  updateUrlParam(
                    "search",
                    (e.target as HTMLInputElement).value,
                  );
              }}
              placeholder="Search catalog items..."
              className="bg-transparent border-none outline-none text-sm w-full pl-3 text-[#7B7B7B] font-poppins placeholder:text-[#7B7B7B]"
            />
            <button
              onClick={() =>
                updateUrlParam("search", searchInputRef.current?.value ?? "")
              }
              className="text-sm cursor-pointer"
            >
              Search
            </button>
          </div>

          {/* Status Dropdown Filter */}
          <div className="relative">
            <select
              value={currentStatus}
              onChange={(e) => updateUrlParam("status", e.target.value)}
              className="appearance-none bg-[#F9FAFB] text-sm px-4 pr-10 py-3.5 rounded-lg outline-none text-gray-700 cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>

            <svg
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m6 9 6 6 6-6"
              />
            </svg>
          </div>
          {/* Add Category Trigger */}
          <div className="w-full sm:w-auto">
            <PrimaryButton
              onClick={() => router.push(currentTabConfig.route)}
              label={currentTabConfig.label}
              icon={<PluseIcon />}
            />
          </div>
        </div>
      </div>
      <CategoryNavigation />
    </div>
  );
};

export default CatalogHead;
