// "use client";

// import { useState } from "react";
// import { ArrowUpDown, Search } from "lucide-react";
// import { useRouter, usePathname, useSearchParams } from "next/navigation";
// import CustomerTable from "./CustomerTable";
// import ReviewTable from "./ReviewTable";
// import SelectTrigger from "../common/SelectTrigger";

// export default function CustomersReviewsMainSection() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   const customerSearch = searchParams.get("c_search") || "";
//   const reviewSort = searchParams.get("r_sort") || "desc";

//   const [cInput, setCInput] = useState(customerSearch);

//   // useEffect(() => {
//   //   setCInput(customerSearch);
//   // }, [customerSearch]);

//   const handleCustomerSearchSubmit = () => {
//     const params = new URLSearchParams(searchParams.toString());
//     if (cInput.trim()) {
//       params.set("c_search", cInput.trim());
//     } else {
//       params.delete("c_search");
//     }
//     params.set("c_page", "1");
//     router.push(`${pathname}?${params.toString()}`);
//   };

//   const toggleReviewSort = () => {
//     const params = new URLSearchParams(searchParams.toString());
//     params.set("r_sort", reviewSort === "desc" ? "asc" : "desc");
//     router.push(`${pathname}?${params.toString()}`);
//   };

//   return (
//     <div className="w-full bg-white min-h-screen font-poppins">
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
//         {/* Left Section: Live Customer Search Registry */}
//         <div className="flex flex-col gap-4">
//           <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full px-2">
//             <div className="relative flex items-center bg-[#F9F9F9] rounded-[8px] px-3 py-2 w-full md:w-[292px]">
//               <Search size={24} className="text-[#000000] mr-2" />
//               <input
//                 type="text"
//                 value={cInput}
//                 onChange={(e) => setCInput(e.target.value)}
//                 onKeyDown={(e) =>
//                   e.key === "Enter" && handleCustomerSearchSubmit()
//                 }
//                 placeholder="Search Customers"
//                 className="bg-transparent border-none outline-none text-sm w-full text-black placeholder:text-[#7B7B7B]"
//               />
//               <button
//                 onClick={handleCustomerSearchSubmit}
//                 className="text-sm cursor-pointer font-normal text-black ml-2"
//               >
//                 Search
//               </button>
//             </div>

//             <div className="flex items-center gap-2 self-end sm:self-auto">
//               <span className="text-[12px] text-[#7B7B7B] font-normal">
//                 Sort by
//               </span>
//               <SelectTrigger label="Newest" />
//               <button className="p-2 bg-[#F9F9F9] rounded-[4px] text-black">
//                 <ArrowUpDown size={20} />
//               </button>
//             </div>
//           </div>

//           <CustomerTable />
//         </div>

//         {/* Right Section: Product Feedback Reviews Logs */}
//         <div className="flex flex-col gap-4">
//           <div className="flex items-center justify-between w-full h-[42px] px-2">
//             <h3 className="text-base text-black font-medium font-poppins">
//               Review Logs
//             </h3>
//             <div className="flex items-center gap-2 self-end sm:self-auto">
//               <span className="text-[12px] text-[#7B7B7B] font-normal">
//                 Sort sequence
//               </span>
//               <button
//                 onClick={toggleReviewSort}
//                 className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-gray-50 rounded-[6px] text-black border border-gray-100 hover:bg-gray-100 transition-all"
//               >
//                 {reviewSort === "desc" ? "Newest" : "Oldest"}
//                 <ArrowUpDown size={16} className="ml-1" />
//               </button>
//             </div>
//           </div>

//           <ReviewTable />
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import CustomerTable from "./CustomerTable";
import ReviewTable from "./ReviewTable";

export default function CustomersReviewsMainSection() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL States for Customer
  const customerSearch = searchParams.get("c_search") || "";
  const customerSort = searchParams.get("c_sort") || "desc"; // Default to desc (Newest)

  // URL States for Reviews
  const reviewSort = searchParams.get("r_sort") || "desc";

  const [cInput, setCInput] = useState(customerSearch);

  // Function to handle Search
  const handleCustomerSearchSubmit = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (cInput.trim()) {
      params.set("c_search", cInput.trim());
    } else {
      params.delete("c_search");
    }
    params.set("c_page", "1"); // Reset pagination on search
    router.push(`${pathname}?${params.toString()}`);
  };

  // Function to handle Customer Sort (Newest/Oldest)
  const toggleCustomerSort = () => {
    const params = new URLSearchParams(searchParams.toString());
    const newSort = customerSort === "desc" ? "asc" : "desc";
    params.set("c_sort", newSort);
    params.set("c_page", "1"); // Reset pagination on sort change
    router.push(`${pathname}?${params.toString()}`);
  };

  // Function to handle Review Sort
  const toggleReviewSort = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("r_sort", reviewSort === "desc" ? "asc" : "desc");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-full bg-white min-h-screen font-poppins">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Left Section: Customer Registry */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full px-2">
            {/* Search Input */}
            <div className="relative flex items-center bg-[#F9F9F9] rounded-[8px] px-3 py-2 w-full md:w-[292px]">
              <Search size={24} className="text-[#000000] mr-2" />
              <input
                type="text"
                value={cInput}
                onChange={(e) => setCInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleCustomerSearchSubmit()
                }
                placeholder="Search Customers"
                className="bg-transparent border-none outline-none text-sm w-full text-black placeholder:text-[#7B7B7B]"
              />
              <button
                onClick={handleCustomerSearchSubmit}
                className="text-sm cursor-pointer font-normal text-black ml-2"
              >
                Search
              </button>
            </div>

            {/* Customer Sort Logic */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-[12px] text-[#7B7B7B] font-normal">
                Sort by
              </span>
              <button
                onClick={toggleCustomerSort}
                className="flex items-center gap-2 px-3 py-2 bg-[#F9F9F9] rounded-[4px] text-xs font-medium text-black border border-gray-100 hover:bg-gray-100 transition-all"
              >
                {customerSort === "desc" ? "Newest" : "Oldest"}
                <ArrowUpDown size={16} className="text-black" />
              </button>
            </div>
          </div>

          <CustomerTable />
        </div>

        {/* Right Section: Review Logs */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between w-full h-[42px] px-2">
            <h3 className="text-base text-black font-medium font-poppins">
              Review Logs
            </h3>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-[12px] text-[#7B7B7B] font-normal">
                Sort sequence
              </span>
              <button
                onClick={toggleReviewSort}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-gray-50 rounded-[6px] text-black border border-gray-100 hover:bg-gray-100 transition-all"
              >
                {reviewSort === "desc" ? "Newest" : "Oldest"}
                <ArrowUpDown size={16} className="ml-1" />
              </button>
            </div>
          </div>

          <ReviewTable />
        </div>
      </div>
    </div>
  );
}
