// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import { useQuery } from "@tanstack/react-query";
// import { FiHeadphones } from "react-icons/fi";
// import { BsDot } from "react-icons/bs";
// import { format } from "date-fns";
// import StatusBadge from "@/components/store-front/profile/StatusBadge";
// import { getMyOrdersService } from "@/services-api/orderService";

// const backendBaseUrl =
//   process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
//   "http://localhost:8082";

// // --- Strict TypeScript Interfaces ---

// export interface VariantAttribute {
//   type: string;
//   label: string;
//   value: string;
// }

// export interface OrderItem {
//   id: string;
//   product_name: string;
//   quantity: number;
//   product_id: string | null;
//   external_image?: string | null;
//   external_attributes?: string | null;
//   variant?: {
//     images?: string[]; // এটি নিশ্চিত করুন
//     attributes?: VariantAttribute[];
//   } | null;
//   product?: {
//     images?: string[];
//   } | null;
// }
// export interface Order {
//   id: string;
//   order_number: string;
//   status: string;
//   total_amount_due: string;
//   payment_status: string;
//   created_at: string;
//   order_items: OrderItem[];
// }

// const OrdersPage = () => {
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const limit = 10;

//   const { data } = useQuery({
//     queryKey: ["my-orders", currentPage],
//     queryFn: () => getMyOrdersService({ page: currentPage, limit }),
//   });

//   const orders = data?.data?.data || [];
//   const meta = data?.data?.meta;
//   console.log(orders);

//   const resolveImageUrl = (item: OrderItem) => {
//     // Priority: 1. External image > 2. Variant image > 3. Product image
//     const raw =
//       item.external_image ||
//       item.variant?.images?.[0] ||
//       item.product?.images?.[0] ||
//       "";

//     if (!raw) return null;
//     if (raw.startsWith("http")) return raw;

//     return `${backendBaseUrl}${raw.startsWith("/") ? "" : "/"}${raw}`;
//   };

//   const getVariantDisplay = (item: OrderItem) => {
//     // For local products
//     if (item.product_id && item.variant?.attributes) {
//       return item.variant.attributes
//         .map((a) => `${a.label}: ${a.value}`)
//         .join(", ");
//     }
//     // For external/mohasagor products
//     if (item.external_attributes) {
//       try {
//         const attrs = JSON.parse(item.external_attributes);
//         if (Array.isArray(attrs)) {
//           return attrs
//             .map((a: any) => `${a.label || "Variant"}: ${a.value || a.name}`)
//             .join(", ");
//         }
//       } catch (e) {
//         return null;
//       }
//     }
//     return null;
//   };

//   return (
//     <div className="bg-white rounded-[12px] border border-[#D2D2D2] overflow-hidden font-poppins">
//       <div className="p-6 border-b border-[#F2F2F2]">
//         <h2 className="text-[20px] font-medium text-black">
//           Orders ({meta?.total || 0})
//         </h2>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="w-full text-left border-collapse">
//           <thead>
//             <tr className="bg-[#F9FAFB] text-[#727272] text-[14px] font-medium">
//               <th className="p-5 pl-8">No.</th>
//               <th className="p-5">Order Id</th>
//               <th className="p-5">Product Details</th>
//               <th className="p-5">Date</th>
//               <th className="p-5">Price</th>
//               <th className="p-5">Payment</th>
//               <th className="p-5">Status</th>
//             </tr>
//           </thead>
//           <tbody className="text-[14px] text-[#4D4D4D]">
//             {orders.length > 0 ? (
//               orders.map((order, index) => {
//                 const firstItem = order.order_items?.[0];
//                 const serialNumber = meta
//                   ? (meta.page - 1) * meta.limit + index + 1
//                   : index + 1;
//                 const imageUrl = firstItem ? resolveImageUrl(firstItem) : null;
//                 const variantText = firstItem
//                   ? getVariantDisplay(firstItem)
//                   : null;

//                 return (
//                   <tr
//                     key={order.id}
//                     className="border-b border-[#F9F9F9] hover:bg-gray-50 transition-colors"
//                   >
//                     <td className="p-5 pl-8 text-[#727272]">{serialNumber}</td>
//                     <td className="p-5 font-medium text-black">
//                       #{order.order_number}
//                     </td>
//                     <td className="p-5">
//                       <div className="flex items-center gap-3">
//                         <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-100">
//                           {imageUrl ? (
//                             <Image
//                               src={imageUrl}
//                               alt=""
//                               fill
//                               className="object-cover"
//                               unoptimized
//                             />
//                           ) : (
//                             <div className="w-full h-full flex items-center justify-center">
//                               <FiHeadphones
//                                 size={20}
//                                 className="text-[#FF7050]"
//                               />
//                             </div>
//                           )}
//                         </div>
//                         <div className="flex flex-col min-w-0">
//                           <p
//                             className="font-medium text-black truncate max-w-[200px]"
//                             title={firstItem?.product_name}
//                           >
//                             {firstItem?.product_name || "N/A"}
//                             {order.order_items.length > 1 && (
//                               <span className="text-[#FF7050] text-[11px] ml-1 bg-[#FF7050]/10 px-1.5 py-0.5 rounded-full">
//                                 +{order.order_items.length - 1} more
//                               </span>
//                             )}
//                           </p>
//                           {variantText && (
//                             <p className="text-[11px] text-[#727272] mt-0.5 italic">
//                               {variantText}
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                     </td>
//                     <td className="p-5 whitespace-nowrap text-[12px]">
//                       <div>
//                         {format(new Date(order.created_at), "dd MMM yyyy")}
//                       </div>
//                       <div className="text-gray-400">
//                         {format(new Date(order.created_at), "hh:mm a")}
//                       </div>
//                     </td>
//                     <td className="p-5 font-medium text-black text-base">
//                       ৳{order.total_amount_due}
//                     </td>
//                     <td className="p-5">
//                       <div className="flex items-center">
//                         <BsDot
//                           size={24}
//                           className={
//                             order.payment_status === "PAID"
//                               ? "text-green-500"
//                               : "text-[#FF7050]"
//                           }
//                         />
//                         <span className="text-[12px] font-semibold">
//                           {order.payment_status}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="p-5">
//                       <StatusBadge status={order.status} />
//                     </td>
//                   </tr>
//                 );
//               })
//             ) : (
//               <tr>
//                 <td colSpan={7} className="p-20 text-center text-gray-400">
//                   No orders found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination remains the same */}
//       {/* ... pagination UI ... */}
//     </div>
//   );
// };

// export default OrdersPage;

"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { FiHeadphones, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { BsDot } from "react-icons/bs";
import { format } from "date-fns";
import StatusBadge from "@/components/store-front/profile/StatusBadge";
import { getMyOrdersService } from "@/services-api/orderService";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";

const backendBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
  "http://localhost:8082";

// --- Strict TypeScript Interfaces ---

// const { language } = useLanguage();
// const t = translations[language];

export interface VariantAttribute {
  type: string;
  label: string;
  value: string;
}

export interface ExternalAttribute {
  label?: string;
  name?: string;
  value?: string;
}

export interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  product_id: string | null;
  external_image?: string | null;
  external_attributes?: string | null;
  variant?: {
    images?: string[];
    attributes?: VariantAttribute[];
  } | null;
  product?: {
    images?: string[];
  } | null;
}

export interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount_due: string;
  payment_status: string;
  created_at: string;
  order_items: OrderItem[];
}

export interface OrdersMeta {
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface GetMyOrdersResponse {
  data: {
    data: Order[];
    meta: OrdersMeta;
  };
}

const OrdersPage = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10;

  const { data, isLoading } = useQuery<GetMyOrdersResponse>({
    queryKey: ["my-orders", currentPage],
    queryFn: () => getMyOrdersService({ page: currentPage, limit }),
  });

  const orders: Order[] = data?.data?.data || [];
  const meta: OrdersMeta | undefined = data?.data?.meta;

  const totalPages =
    meta?.totalPages ?? (meta ? Math.ceil(meta.total / meta.limit) : 1);

  const resolveImageUrl = (item: OrderItem): string | null => {
    // Priority: 1. External image > 2. Variant image > 3. Product image
    const raw =
      item.external_image ||
      item.variant?.images?.[0] ||
      item.product?.images?.[0] ||
      "";

    if (!raw) return null;
    if (raw.startsWith("http")) return raw;

    return `${backendBaseUrl}${raw.startsWith("/") ? "" : "/"}${raw}`;
  };

  const getVariantDisplay = (item: OrderItem): string | null => {
    // For local products
    if (item.product_id && item.variant?.attributes) {
      return item.variant.attributes
        .map((a) => `${a.label}: ${a.value}`)
        .join(", ");
    }
    // For external/mohasagor products
    if (item.external_attributes) {
      try {
        const attrs: ExternalAttribute[] = JSON.parse(item.external_attributes);
        if (Array.isArray(attrs)) {
          return attrs
            .map((a) => `${a.label || a.name || "Variant"}: ${a.value ?? ""}`)
            .join(", ");
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages || prev + 1));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const getPageNumbers = (): number[] => {
    if (!totalPages || totalPages <= 1) return [1];

    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="bg-white rounded-[12px] border border-[#D2D2D2] overflow-hidden font-poppins">
      <div className="p-6 border-b border-[#F2F2F2]">
        <h2 className="text-[20px] font-medium text-black">
          {t.order} ({meta?.total || 0})
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F9FAFB] text-[#727272] text-[14px] font-medium">
              <th className="p-5 pl-8">{t.orderId}</th>
              <th className="p-5">{t.orderNumber}</th>
              <th className="p-5">{t.orderItems}</th>
              <th className="p-5">{t.orderDate}</th>
              <th className="p-5">{t.orderPrice}</th>
              <th className="p-5">{t.orderPayment}</th>
              <th className="p-5">{t.orderStatus}</th>
            </tr>
          </thead>
          <tbody className="text-[14px] text-[#4D4D4D]">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-20 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : orders.length > 0 ? (
              orders.map((order, index) => {
                const firstItem = order.order_items?.[0];
                const serialNumber = meta
                  ? (meta.page - 1) * meta.limit + index + 1
                  : index + 1;
                const imageUrl = firstItem ? resolveImageUrl(firstItem) : null;
                const variantText = firstItem
                  ? getVariantDisplay(firstItem)
                  : null;

                return (
                  <tr
                    key={order.id}
                    className="border-b border-[#F9F9F9] hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-5 pl-8 text-[#727272]">{serialNumber}</td>
                    <td className="p-5 font-medium text-black">
                      #{order.order_number}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt=""
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiHeadphones
                                size={20}
                                className="text-[#FF7050]"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <p
                            className="font-medium text-black truncate max-w-[200px]"
                            title={firstItem?.product_name}
                          >
                            {firstItem?.product_name || "N/A"}
                            {order.order_items.length > 1 && (
                              <span className="text-[#FF7050] text-[11px] ml-1 bg-[#FF7050]/10 px-1.5 py-0.5 rounded-full">
                                +{order.order_items.length - 1} more
                              </span>
                            )}
                          </p>
                          {variantText && (
                            <p className="text-[11px] text-[#727272] mt-0.5 italic">
                              {variantText}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-5 whitespace-nowrap text-[12px]">
                      <div>
                        {format(new Date(order.created_at), "dd MMM yyyy")}
                      </div>
                      <div className="text-gray-400">
                        {format(new Date(order.created_at), "hh:mm a")}
                      </div>
                    </td>
                    <td className="p-5 font-medium text-black text-base">
                      ৳{order.total_amount_due}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center">
                        <BsDot
                          size={24}
                          className={
                            order.payment_status === "PAID"
                              ? "text-green-500"
                              : "text-[#FF7050]"
                          }
                        />
                        <span className="text-[12px] font-semibold">
                          {order.payment_status}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="p-20 text-center text-gray-400">
                  {t.emptyordertext}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {orders.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#F2F2F2]">
          <p className="text-[13px] text-[#727272]">
            Page {currentPage} of {totalPages}
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-[#D2D2D2] text-[#727272] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              aria-label="Previous page"
            >
              <FiChevronLeft size={16} />
            </button>

            {getPageNumbers().map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => handlePageClick(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-md text-[13px] font-medium transition-colors ${
                  page === currentPage
                    ? "bg-[#FF7050] text-white"
                    : "text-[#4D4D4D] border border-[#D2D2D2] hover:bg-gray-50"
                }`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-[#D2D2D2] text-[#727272] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              aria-label="Next page"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
