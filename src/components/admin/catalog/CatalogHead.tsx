"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import PluseIcon from "@/components/store-front/svg/svg/PluseIcon";
import PrimaryButton from "../common/PrimaryButton";
import CategoryNavigation from "./CategoryNavigation";

const CatalogHead = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") || "";
  const currentStatus = searchParams.get("status") || "";

  // UPDATE THIS IN YOUR CatalogHead.tsx FILE:
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
    <div className="w-full bg-white p-5 font-lato mt-2 border-b border-gray-100">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <h2 className="text-[#023337] text-[22px] font-bold">Catalog</h2>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full lg:w-auto">
          {/* Search Inputs */}
          <div className="bg-[#F9F9F9]  rounded-[8px] px-3 py-2 flex items-center w-full md:w-[240px]">
            <input
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
              className="bg-transparent border-none outline-none text-xs w-full text-black placeholder:text-gray-400"
            />
          </div>

          {/* Status Dropdown Filter */}
          <select
            value={currentStatus}
            onChange={(e) => updateUrlParam("status", e.target.value)}
            className="bg-[#F9FAFB]  text-xs px-3 py-2.5 rounded-[8px] outline-none text-gray-700 cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>

          {/* Limit Dropdown Selector */}
          {/* <select
            value={currentLimit}
            onChange={(e) => updateUrlParam("limit", e.target.value)}
            className="bg-[#F9FAFB]  text-xs px-3 py-2.5 rounded-[8px] outline-none text-gray-700 cursor-pointer"
          >
            <option value="10">10 Rows</option>
            <option value="25">25 Rows</option>
            <option value="50">50 Rows</option>
          </select> */}

          {/* Add Category Trigger */}
          <div className="w-full sm:w-auto">
            <PrimaryButton
              /* 🚀 FIXED: Labels and routes update dynamically based on the current context parameters */
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
