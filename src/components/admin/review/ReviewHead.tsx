"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import PluseIcon from "@/components/store-front/svg/svg/PluseIcon";
import PrimaryButton from "../common/PrimaryButton";
import SelectTrigger from "../common/SelectTrigger";

const ReviewHead = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") || "";
  //Bind to c_search to synchronize across the customer view registry
  const globalSearch = searchParams.get("c_search") || "";
  const [searchInput, setSearchInput] = useState(globalSearch);

  const handleSearchSubmit = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput.trim()) {
      params.set("c_search", searchInput.trim());
    } else {
      params.delete("c_search");
    }
    params.set("c_page", "1");
    params.set("r_page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleStatusSelect = (statusValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (statusValue) {
      params.set("status", statusValue);
    } else {
      params.delete("status");
    }
    params.set("r_page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-full bg-white p-5 font-lato mt-2">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h2 className="text-[#023337] text-[22px] font-bold font-lato">
          Customers Review
        </h2>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full lg:w-auto">
          <div className="relative flex items-center bg-[#F9F9F9] rounded-[8px] px-3 py-2 w-full md:w-[292px]">
            <Search size={24} className="text-[#000000] mr-2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
              placeholder="Search Customers..."
              className="bg-transparent border-none outline-none text-sm w-full text-black placeholder:text-[#7B7B7B]"
            />
            <button
              onClick={handleSearchSubmit}
              className="text-sm cursor-pointer font-normal text-black ml-2 font-semibold"
            >
              Search
            </button>
          </div>

          <div className="relative group">
            <SelectTrigger
              label={
                currentStatus === ""
                  ? "All Status"
                  : currentStatus.toLowerCase()
              }
            />
            <div className="absolute left-0 mt-1 hidden group-hover:block bg-white border border-gray-100 rounded-[8px] shadow-xl z-50 text-xs text-black py-1 min-w-[120px]">
              <button
                onClick={() => handleStatusSelect("")}
                className="w-full text-left px-3 py-2 hover:bg-gray-50"
              >
                All Status
              </button>
              <button
                onClick={() => handleStatusSelect("PENDING")}
                className="w-full text-left px-3 py-2 hover:bg-gray-50"
              >
                Pending
              </button>
              <button
                onClick={() => handleStatusSelect("APPROVED")}
                className="w-full text-left px-3 py-2 hover:bg-gray-50"
              >
                Approved
              </button>
              <button
                onClick={() => handleStatusSelect("REJECTED")}
                className="w-full text-left px-3 py-2 hover:bg-gray-50"
              >
                Rejected
              </button>
            </div>
          </div>

          {/* <SelectTrigger label="10 Tags" /> */}

          {/* <div className="w-full sm:w-auto">
            <PrimaryButton
              label="Add Customer"
              icon={<PluseIcon />}
              onClick={() => router.push("/admin/dashboard/users/create")}
            />
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ReviewHead;
