// "use client";
// import { useState, useRef, useMemo } from "react";
// import {
//   useQuery,
//   useMutation,
//   useQueryClient,
//   useQueries,
// } from "@tanstack/react-query";
// import {
//   Search,
//   MoreVertical,
//   Edit,
//   Printer,
//   FileText,
//   RefreshCw,
//   Trash2,
//   ChevronLeft,
//   X,
//   Loader2,
//   User,
//   MapPin,
//   Package,
//   Info,
//   Clock,
//   CheckCircle2,
//   PauseCircle,
//   Truck,
//   PackageCheck,
//   XCircle,
//   RotateCcw,
// } from "lucide-react";
// import Image from "next/image";
// import { debounce } from "lodash";
// import { toast } from "react-hot-toast";
// import { useReactToPrint } from "react-to-print";

// import DataTable from "../common/DataTable";
// import Pagination2 from "../common/Pagination2";
// import TableTabs from "./TableTabs";

// import {
//   getAllOrdersService,
//   updateOrderStatusService,
//   fetchOrderCounts,
// } from "@/services-api/orderService";
// import { useRouter } from "next/navigation";
// import { InvoicePrint } from "./InvoicePrint";
// import {
//   deleteIncompleteOrderService,
//   getAllIncompleteOrdersService,
// } from "@/services-api/incompleteOrderService";
// import { apiFetch } from "@/utils/api";
// import { Customer, Order } from "@/@types/order.type";

// type User = {
//   id: string;
//   customer_name: string;
//   customer_email: string;
//   customer_phone: string;
//   customer_image: string;
//   avatar?: string;
//   phone?: string;
// };

// const getStatusConfig = (status: string) => {
//   // 🚀 Safe check to prevent "Cannot read properties of undefined (reading 'replace')"
//   if (!status) {
//     return {
//       label: "Unknown",
//       icon: Info,
//       className: "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100",
//       iconColor: "text-gray-400",
//     };
//   }

//   const upper = status.toUpperCase();
//   switch (upper) {
//     case "PENDING":
//       return {
//         label: "Pending",
//         icon: Clock,
//         className:
//           "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
//         iconColor: "text-amber-500",
//       };
//     case "CONFIRMED":
//       return {
//         label: "Confirmed",
//         icon: CheckCircle2,
//         className:
//           "bg-blue-50 text-[#1DA1F2] border-blue-200 hover:bg-blue-100",
//         iconColor: "text-[#1DA1F2]",
//       };
//     case "ON_HOLD":
//       return {
//         label: "On Hold",
//         icon: PauseCircle,
//         className:
//           "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
//         iconColor: "text-orange-500",
//       };
//     case "SHIPPED":
//       return {
//         label: "Shipped",
//         icon: Truck,
//         className:
//           "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
//         iconColor: "text-purple-500",
//       };
//     case "SENT_TO_COURIER":
//       return {
//         label: "Sent to Courier",
//         icon: Truck,
//         className:
//           "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100",
//         iconColor: "text-indigo-500",
//       };
//     case "DELIVERED":
//       return {
//         label: "Delivered",
//         icon: PackageCheck,
//         className:
//           "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
//         iconColor: "text-emerald-500",
//       };
//     case "CANCELED":
//       return {
//         label: "Canceled",
//         icon: XCircle,
//         className: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
//         iconColor: "text-rose-500",
//       };
//     case "RETURNED":
//       return {
//         label: "Returned",
//         icon: RotateCcw,
//         className:
//           "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200",
//         iconColor: "text-gray-500",
//       };
//     case "REFUNDED":
//       return {
//         label: "Refunded",
//         icon: RefreshCw,
//         className: "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100",
//         iconColor: "text-teal-500",
//       };
//     default:
//       return {
//         label: status ? status.replace(/_/g, " ") : "N/A",
//         icon: Info,
//         className: "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100",
//         iconColor: "text-gray-400",
//       };
//   }
// };

// // type OrderItem = {
// //   id: string;
// //   product_name: string;
// //   product_image: string;
// //   unit_price: number;
// //   quantity: number;
// //   product: {
// //     id: string;
// //     name: string;
// //     images: string[];
// //   };
// // };

// // type Order = {
// //   id: string;
// //   order_number: string;
// //   customer_name: string;
// //   customer_email: string;
// //   customer_phone: string;
// //   customer_image: string;
// //   customer_address: string;
// //   customer_note?: string;
// //   source: string;
// //   user_id: string;
// //   order_items: OrderItem[];
// //   status: string;
// //   payment_status: string;
// //   shipping_fee: number;
// //   discount_amount: number;
// //   advance_amount?: number | string;
// //   amount?: number;
// //   total_amount: number;
// //   total_amount_due: number;
// //   total_bill?: number;
// //   totalDue?: number | string;
// //   created_at: string;
// //   cart_items: [];
// //   customer?: {
// //     id?: string;
// //     name: string;
// //     profile?: {
// //       phone?: string;
// //       email?: string;
// //       avatar?: string;
// //       image?: string;
// //     };
// //     avatar?: string;
// //   };
// //   user?: {
// //     profile?: {
// //       image?: string;
// //     };
// //   };
// // };

// export default function OrderTable() {
//   const router = useRouter();
//   const queryClient = useQueryClient();
//   const [activeTab, setActiveTab] = useState(0);
//   const [page, setPage] = useState(1);
//   const [searchQuery, setSearchQuery] = useState("");

//   const tabs = [
//     "All order",
//     "Pending",
//     "Confirmed",
//     "Incomplete",
//     "Delivered",
//     "Canceled",
//     "Returned",
//   ];

//   // Helper logic to prevent routing errors
//   const isIncompleteTab = tabs[activeTab] === "Incomplete";

//   // Action Menu States
//   const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
//   const [menuPos, setMenuPos] = useState({
//     top: 0,
//     left: 0,
//     opensUpward: false,
//   });
//   const [showStatusMenu, setShowStatusMenu] = useState(false);

//   // Modal States
//   const [shippedModal, setShippedModal] = useState<{
//     open: boolean;
//     id: string | null;
//   }>({ open: false, id: null });
//   const [detailsModal, setDetailsModal] = useState<{
//     open: boolean;
//     order: Order | null;
//   }>({ open: false, order: null });

//   const [selectedOrderForPrint, setSelectedOrderForPrint] =
//     useState<Order | null>(null);
//   const invoiceRef = useRef<HTMLDivElement>(null);
//   const menuRef = useRef<HTMLDivElement>(null);

//   const handlePrint = useReactToPrint({
//     contentRef: invoiceRef,
//   });

//   const baseStorageUrl =
//     process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
//     "http://localhost:8083";

//   // --- HELPERS ---
//   const openDetails = (order: Customer) => {
//     setDetailsModal({ open: true, order });
//     setActiveMenuId(null);
//   };

//   // 1. Identify the products that need to be fetched for the modal
//   const modalItems = useMemo(() => {
//     if (!detailsModal.open || !detailsModal.order || !isIncompleteTab)
//       return [];
//     return detailsModal.order.cart_items || [];
//   }, [detailsModal.open, detailsModal.order, isIncompleteTab]);

//   // 2. Fetch details for each item
//   const resolvedModalProducts = useQueries({
//     queries: modalItems.map(
//       (item: { productId: string; variantId?: string }) => ({
//         queryKey: ["product-metadata", item.productId],
//         queryFn: async () => {
//           const res = await apiFetch(`/products/${item.productId}`, {
//             method: "GET",
//           });
//           const json = await res.json();
//           // Ensure we return an object, even if empty, to satisfy the type
//           return json.data || json;
//         },
//         enabled: detailsModal.open && !!item.productId,
//       }),
//     ),
//   });

//   // 3. THE FIX: Cast query.data as any or a specific type to access .id
//   const productDetailsMap = useMemo(() => {
//     const map: Record<string, unknown> = {};
//     resolvedModalProducts.forEach((query) => {
//       // Use type assertion (as any) or check if it's an object with id
//       const product = query.data as { id: string };
//       if (product && product.id) {
//         map[product.id] = product;
//       }
//     });
//     return map;
//   }, [resolvedModalProducts]);

//   const getImgUrl = (rawImg: string) => {
//     const cleanImg = typeof rawImg === "string" ? rawImg.trim() : "";
//     return cleanImg !== ""
//       ? cleanImg.startsWith("http")
//         ? cleanImg
//         : `${baseStorageUrl}/${cleanImg.replace(/^\/+/, "")}`
//       : "/images/products/product2.png";
//   };

//   const fetchedCustomer = detailsModal.order
//     ? {
//         avatar:
//           detailsModal.order.customer_image ||
//           detailsModal.order.customer?.profile?.image ||
//           detailsModal.order.customer?.avatar ||
//           undefined,
//         name: detailsModal.order.customer_name,
//         phone: detailsModal.order.customer_phone,
//       }
//     : null;

//   // --- FETCH DATA ---
//   const { data: serverData, isLoading } = useQuery({
//     queryKey: ["admin-orders", tabs[activeTab], page, searchQuery],
//     queryFn: async () => {
//       if (isIncompleteTab) {
//         // Hits: /incomplete-orders -> Returns { meta, data }
//         return await getAllIncompleteOrdersService({ page, limit: 10 });
//       }

//       // Hits: /orders -> Returns { data: { meta, data } }
//       const status =
//         tabs[activeTab] === "All order" ? "" : tabs[activeTab].toUpperCase();
//       return await getAllOrdersService({
//         page,
//         limit: 10,
//         status,
//         search: searchQuery,
//         refresh: true,
//       });
//     },
//     // This keeps the UI stable while switching tabs
//     placeholderData: (previousData) => previousData,
//   });

//   // 🚀 THE FIX: Universal Data Extractor
//   // This logic looks for the array [...] no matter where the API hides it.
//   const orderList = useMemo(() => {
//     if (!serverData) return [];

//     // 1. Check if it's the Regular Order structure: serverData.data.data
//     if (serverData.data && Array.isArray(serverData.data.data)) {
//       return serverData.data.data;
//     }

//     // 2. Check if it's the Incomplete Order structure: serverData.data
//     if (Array.isArray(serverData.data)) {
//       return serverData.data;
//     }

//     // 3. Fallback if the whole object is the array (unlikely but safe)
//     if (Array.isArray(serverData)) {
//       return serverData;
//     }

//     return []; // Always return an array to prevent .map() crash
//   }, [serverData]);

//   // 🚀 THE FIX: Universal Meta Extractor
//   const meta = useMemo(() => {
//     // Look for meta in serverData.data (Regular) or serverData (Incomplete)
//     const m = serverData?.data?.meta || serverData?.meta;
//     return m || { totalPages: 1, total: 0 };
//   }, [serverData]);

//   // --- FIXED FETCH TAB COUNTS ---
//   const { data: tabCountsData } = useQuery({
//     queryKey: ["order-tab-counts"],
//     queryFn: async () => {
//       // 1. Fetch standard counts from the regular Order Service
//       const standardTabs = tabs.filter((t) => t !== "Incomplete");
//       const standardCounts = await fetchOrderCounts(standardTabs);

//       // 2. Fetch Incomplete count from the Incomplete Order Service
//       // We set limit to 1 because we only care about the meta.total field
//       let incompleteCount = 0;
//       try {
//         const leadRes = await getAllIncompleteOrdersService({
//           page: 1,
//           limit: 1,
//         });
//         // Based on your backend, total is inside meta
//         incompleteCount =
//           leadRes?.meta?.total || leadRes?.data?.meta?.total || 0;
//       } catch (e) {
//         console.error("Failed to fetch incomplete counts", e);
//       }

//       // 3. Return the merged array
//       return [...standardCounts, { tab: "Incomplete", count: incompleteCount }];
//     },
//     refetchOnWindowFocus: true,
//   });

//   // This converts the array into a Map so the UI can find the counts easily
//   const counts = useMemo(() => {
//     return (
//       tabCountsData?.reduce(
//         (
//           acc: {
//             [key: string]: number;
//           },
//           curr: {
//             tab: string;
//             count: number;
//           },
//         ) => ({
//           ...acc,
//           [curr.tab]: curr.count,
//         }),
//         {},
//       ) || {}
//     );
//   }, [tabCountsData]);

//   // --- MUTATIONS ---
//   const statusMutation = useMutation({
//     mutationFn: ({
//       id,
//       payload,
//     }: {
//       id: string;
//       payload: {
//         status: string;
//         payment_status: string;
//       };
//     }) => updateOrderStatusService(id, payload),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
//       queryClient.invalidateQueries({ queryKey: ["order-tab-counts"] });
//       toast.success("Sync successful.");
//       setActiveMenuId(null);
//       setShippedModal({ open: false, id: null });
//     },
//   });

//   const handleSearch = debounce((val: string) => {
//     setSearchQuery(val);
//     setPage(1);
//   }, 500);

//   const deleteLeadMutation = useMutation({
//     mutationFn: (id: string) => deleteIncompleteOrderService(id),
//     onSuccess: () => {
//       // Refresh the list and the counts
//       queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
//       queryClient.invalidateQueries({ queryKey: ["order-tab-counts"] });
//       toast.success("Lead removed successfully");
//       setActiveMenuId(null);
//     },
//     onError: (error: Error) => {
//       toast.error(error.message || "Failed to delete");
//     },
//   });

//   // --- COLUMNS ---
//   const columns = [
//     {
//       header: isIncompleteTab ? "Lead ID" : "Order Id",
//       key: "id",
//       render: (item: {
//         id: string;
//         order_number: string;
//         customer_name: string;
//         customer_phone: string;
//         amount: number;
//         total_amount: number;
//       }) => (
//         <span
//           onClick={() => openDetails(item)}
//           className="font-medium text-[14px] cursor-pointer hover:text-[#1DA1F2] transition-colors"
//         >
//           {isIncompleteTab ? `LEAD-${item.id.slice(0, 8)}` : item.order_number}
//         </span>
//       ),
//     },
//     {
//       header: "Product",
//       key: "product",
//       render: (item: Order) => {
//         const items = isIncompleteTab
//           ? item.cart_items || []
//           : item.order_items || [];
//         const firstItem = items[0];

//         const productInfo = firstItem?.product || {};
//         const variantInfo = firstItem?.variant || {};

//         // Prioritize variant image, then product image, then fallbacks
//         const img =
//           variantInfo.images?.[0] ||
//           productInfo.images?.[0] ||
//           productInfo.featuredImage ||
//           firstItem?.image ||
//           firstItem?.externalImage;

//         const name =
//           productInfo.name ||
//           firstItem?.product_name ||
//           firstItem?.externalName ||
//           (isIncompleteTab ? "Guest Item" : "Untitled");

//         return (
//           <div
//             onClick={() => openDetails(item)}
//             className="flex items-center gap-3 cursor-pointer group"
//           >
//             <Image
//               src={getImgUrl(img)}
//               alt="product"
//               width={40}
//               height={40}
//               unoptimized
//               className="rounded-lg object-cover bg-gray-50 p-1 group-hover:border-[#1DA1F2] transition-all"
//             />
//             <div className="flex flex-col">
//               <span className="truncate max-w-[150px] text-[14px] font-medium text-black group-hover:text-[#1DA1F2] transition-colors">
//                 {name}
//               </span>
//               {items.length > 1 && (
//                 <span className="text-[10px] text-[#1DA1F2] font-bold">
//                   +{items.length - 1} more items
//                 </span>
//               )}
//             </div>
//           </div>
//         );
//       },
//     },
//     {
//       header: "Customer",
//       key: "customer",
//       render: (item: { customer_name: string; customer_phone: string }) => (
//         <div onClick={() => openDetails(item)} className="cursor-pointer">
//           <p className="font-medium text-[14px] text-black">
//             {item.customer_name || "Anonymous Guest"}
//           </p>
//           <p className="text-[12px] text-gray-500">
//             {item.customer_phone || "No Phone"}
//           </p>
//         </div>
//       ),
//     },
//     {
//       header: "Amount",
//       key: "amount",
//       render: (item: Order) => {
//         const items = item.order_items || item.cart_items || [];
//         const subtotal = items.reduce(
//           (
//             sum: number,
//             i: {
//               unit_price?: number | string;
//               price?: number | string;
//               quantity?: number | string;
//               qty?: number | string;
//             },
//           ) =>
//             sum +
//             Number(i.unit_price || i.price || 0) *
//               Number(i.quantity || i.qty || 1),
//           0,
//         );
//         const shipping = Number(item.shipping_fee || 0);
//         const discount = Number(item.discount_amount || 0);

//         // Actual Order Amount = Subtotal + Shipping Fee - Discount
//         const totalValue = isIncompleteTab
//           ? Number(item.total_amount)
//           : subtotal + shipping - discount;

//         return (
//           <div
//             onClick={() => openDetails(item)}
//             className="cursor-pointer space-y-0.5"
//           >
//             <span className="font-semibold text-[14px] text-black block">
//               ৳{totalValue || 0}
//             </span>
//             {isIncompleteTab && (
//               <span className="text-[10px] text-gray-400">Potential Sale</span>
//             )}
//           </div>
//         );
//       },
//     },
//     {
//       header: "Status",
//       key: "status",
//       render: (item: { status: string }) => {
//         if (isIncompleteTab) {
//           return (
//             <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[13px] font-semibold bg-gray-50 text-gray-400 border-gray-200">
//               <Clock size={15} />
//               <span>Abandoned</span>
//             </div>
//           );
//         }
//         const config = getStatusConfig(item.status);
//         const IconComponent = config.icon;
//         return (
//           <div
//             onClick={() => openDetails(item)}
//             className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[13px] font-semibold transition-all ${config.className}`}
//           >
//             <IconComponent size={15} className={config.iconColor} />
//             <span className="capitalize">{config.label}</span>
//           </div>
//         );
//       },
//     },
//     {
//       header: "Action",
//       key: "action",
//       render: (order: Order) => (
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             const rect = e.currentTarget.getBoundingClientRect();
//             setMenuPos({
//               top: rect.bottom + 8,
//               left: rect.left - 165,
//               opensUpward: false,
//             });
//             setActiveMenuId(activeMenuId === order.id ? null : order.id);
//             setShowStatusMenu(false);
//           }}
//           className="p-1 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
//         >
//           <MoreVertical size={20} />
//         </button>
//       ),
//     },
//   ];

//   if (isLoading)
//     return (
//       <div className="h-64 flex flex-col items-center justify-center gap-2">
//         <Loader2 className="animate-spin text-[#1DA1F2]" />
//         <span className="text-xs text-gray-400">Loading order dataset...</span>
//       </div>
//     );

//   return (
//     <div className="w-full font-lato">
//       <div className="bg-white rounded-lg mt-4 relative">
//         <div className="p-4 flex flex-col lg:flex-row justify-between items-center gap-4">
//           <TableTabs
//             tabs={tabs.map((t) => `${t} (${counts[t] || 0})`)}
//             activeTab={activeTab}
//             setActiveTab={(idx) => {
//               setActiveTab(idx);
//               setPage(1);
//             }}
//           />

//           {/* --- CONDITIONALLY HIDE SEARCH BAR --- */}
//           {!isIncompleteTab && (
//             <div className="relative flex-grow lg:w-[316px] animate-in fade-in duration-200">
//               <input
//                 type="text"
//                 placeholder="Search orders..."
//                 onChange={(e) => handleSearch(e.target.value)}
//                 className="w-full bg-[#F9FAFB] rounded-lg py-2.5 pl-4 pr-10 text-[14px] text-black border border-transparent focus:ring-2 focus:ring-[#1DA1F2]/30 focus:border-[#1DA1F2] outline-none transition-all"
//               />
//               <Search
//                 className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
//                 size={20}
//               />
//             </div>
//           )}
//         </div>

//         <DataTable data={orderList} columns={columns} rowKey="id" />

//         <div className="py-5">
//           <Pagination2
//             currentPage={page}
//             totalPages={meta.totalPages}
//             onPageChange={setPage}
//           />
//         </div>
//       </div>

//       {/* --- MODIFIED ACTION MENU --- */}
//       {activeMenuId && (
//         <div
//           ref={menuRef}
//           className="fixed bg-white border border-gray-100 rounded-xl shadow-2xl py-2 z-[9999] w-[210px] animate-in fade-in zoom-in duration-150"
//           style={{ top: menuPos.top, left: menuPos.left }}
//         >
//           {/* Group 1: Core Actions (Hidden for Incomplete) */}
//           {!isIncompleteTab && (
//             <div className="px-2 pb-1.5 border-b border-gray-50 mb-1.5">
//               <button
//                 onClick={() =>
//                   router.push(`/admin/dashboard/order/add?id=${activeMenuId}`)
//                 }
//                 className="w-full text-left px-3 py-2 text-[14px] text-gray-600 hover:bg-blue-50 hover:text-[#1DA1F2] rounded-lg flex items-center gap-3 transition-colors group"
//               >
//                 <Edit
//                   size={16}
//                   className="text-gray-400 group-hover:text-[#1DA1F2]"
//                 />
//                 <span className="font-medium">Edit Order</span>
//               </button>
//             </div>
//           )}

//           {/* Group 2: View & Output (Conditional Print) */}
//           <div className="px-2 pb-1.5 border-b border-gray-50 mb-1.5">
//             {!isIncompleteTab && (
//               <button
//                 onClick={() => {
//                   const o = orderList.find(
//                     (x: { id: string }) => x.id === activeMenuId,
//                   );
//                   setSelectedOrderForPrint(o);
//                   setActiveMenuId(null);
//                   setTimeout(() => {
//                     handlePrint();
//                   }, 100);
//                 }}
//                 className="w-full text-left px-3 py-2 text-[14px] text-gray-600 hover:bg-blue-50 hover:text-[#1DA1F2] rounded-lg flex items-center gap-3 transition-colors group"
//               >
//                 <Printer
//                   size={16}
//                   className="text-gray-400 group-hover:text-[#1DA1F2]"
//                 />
//                 <span className="font-medium">Print Invoice</span>
//               </button>
//             )}

//             <button
//               onClick={() => {
//                 const o = orderList.find(
//                   (x: { id: string }) => x.id === activeMenuId,
//                 );
//                 openDetails(o);
//               }}
//               className="w-full text-left px-3 py-2 text-[14px] text-gray-600 hover:bg-blue-50 hover:text-[#1DA1F2] rounded-lg flex items-center gap-3 transition-colors group"
//             >
//               <FileText
//                 size={16}
//                 className="text-gray-400 group-hover:text-[#1DA1F2]"
//               />
//               <span className="font-medium">View Details</span>
//             </button>
//           </div>

//           {/* Group 3: Status Management (Hidden for Incomplete) */}
//           {!isIncompleteTab && (
//             <div className="px-2 pb-1.5 border-b border-gray-50 mb-1.5">
//               <div className="relative group/status">
//                 <button
//                   onMouseEnter={() => setShowStatusMenu(true)}
//                   className="w-full flex items-center justify-between px-3 py-2 text-[14px] text-gray-600 hover:bg-blue-50 hover:text-[#1DA1F2] rounded-lg transition-colors"
//                 >
//                   <div className="flex items-center gap-3">
//                     <RefreshCw size={16} className="text-gray-400" />
//                     <span className="font-medium">Update Status</span>
//                   </div>
//                   <ChevronLeft size={14} className="opacity-50" />
//                 </button>

//                 {showStatusMenu && (
//                   <div className="absolute right-full mr-2 w-[180px] bg-white border border-gray-100 rounded-xl shadow-2xl py-2 z-[10000]">
//                     {[
//                       "PENDING",
//                       "CONFIRMED",
//                       "ON_HOLD",
//                       "SHIPPED",
//                       "DELIVERED",
//                       "CANCELED",
//                     ].map((s) => (
//                       <button
//                         key={s}
//                         onClick={() =>
//                           statusMutation.mutate({
//                             id: activeMenuId!,
//                             payload: { status: s },
//                           })
//                         }
//                         className="w-full text-left px-4 py-1.5 text-[13px] text-gray-700 hover:bg-blue-50 hover:text-[#1DA1F2]"
//                       >
//                         {s}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Group 4: Dangerous Actions */}
//           <div className="px-2">
//             <button
//               onClick={() => {
//                 if (!activeMenuId) return;

//                 // Confirmation dialog for professionalism
//                 const msg = isIncompleteTab
//                   ? "Are you sure you want to delete this incomplete lead?"
//                   : "Are you sure you want to delete this order?";

//                 if (window.confirm(msg)) {
//                   if (isIncompleteTab) {
//                     deleteLeadMutation.mutate(activeMenuId);
//                   } else {
//                     // If you have a regular order delete mutation, call it here
//                     // orderDeleteMutation.mutate(activeMenuId);
//                     toast.error("Order deletion not implemented yet.");
//                   }
//                 }
//               }}
//               className="w-full text-left px-3 py-2.5 text-[14px] text-rose-500 hover:bg-rose-50 rounded-lg flex items-center gap-3 transition-colors font-bold cursor-pointer"
//             >
//               {deleteLeadMutation.isPending ? (
//                 <Loader2 size={16} className="animate-spin" />
//               ) : (
//                 <Trash2 size={16} />
//               )}
//               <span>
//                 {deleteLeadMutation.isPending
//                   ? "Deleting..."
//                   : `Delete ${isIncompleteTab ? "Lead" : "Order"}`}
//               </span>
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Hidden component for printing */}
//       <div className="hidden">
//         <InvoicePrint
//           ref={invoiceRef}
//           order={selectedOrderForPrint}
//           baseStorageUrl={baseStorageUrl}
//         />
//       </div>

//       {/* --- DETAILS MODAL --- */}
//       {detailsModal.open && detailsModal.order && (
//         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10001] p-4 backdrop-blur-sm animate-in fade-in duration-200">
//           <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden font-lato flex flex-col text-left">
//             <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-[#F9FAFB]">
//               <div className="flex items-center gap-3">
//                 <div className="bg-[#1DA1F2]/10 p-2 rounded-lg text-[#1DA1F2]">
//                   <Package size={20} />
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-bold text-[#023337]">
//                     {detailsModal.order.cart_items
//                       ? "Incomplete Lead Details"
//                       : "Order Summary"}
//                   </h3>
//                   <p className="text-xs text-gray-500 font-medium">
//                     {detailsModal.order.order_number
//                       ? `#${detailsModal.order.order_number}`
//                       : `LEAD-${detailsModal.order.id.slice(0, 8)}`}
//                   </p>
//                 </div>
//               </div>
//               <button
//                 onClick={() => setDetailsModal({ open: false, order: null })}
//                 className="p-2 hover:bg-gray-200 rounded-full cursor-pointer transition-colors"
//               >
//                 <X size={20} className="text-gray-500" />
//               </button>
//             </div>

//             <div className="flex-1 overflow-y-auto p-6 space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 {/* Customer Card */}
//                 <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-start gap-4">
//                   <div className="bg-white rounded-lg shadow-sm overflow-hidden flex-shrink-0 w-11 h-11 flex items-center justify-center">
//                     {/* FIXED fetchedCustomer check */}
//                     {typeof fetchedCustomer !== "undefined" &&
//                     fetchedCustomer?.avatar ? (
//                       <Image
//                         src={getImgUrl(fetchedCustomer.avatar)}
//                         className="w-full h-full object-cover"
//                         width={44}
//                         height={44}
//                         alt="avatar"
//                         unoptimized
//                       />
//                     ) : (
//                       <div className="text-blue-500">
//                         <User size={20} />
//                       </div>
//                     )}
//                   </div>
//                   <div>
//                     <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">
//                       Contact
//                     </p>
//                     <p className="font-bold text-[#023337]">
//                       {detailsModal.order.customer_name || "Guest"}
//                     </p>
//                     <p className="text-sm text-gray-600">
//                       {detailsModal.order.customer_phone || "No Phone"}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl flex items-start gap-4">
//                   <div className="bg-white p-2 rounded-lg shadow-sm text-emerald-500">
//                     <MapPin size={20} />
//                   </div>
//                   <div>
//                     <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
//                       Address
//                     </p>
//                     <p className="text-sm font-medium text-gray-700 leading-tight">
//                       {detailsModal.order.customer_address ||
//                         "No address provided"}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-xl flex items-start gap-4">
//                   <div className="bg-white p-2 rounded-lg shadow-sm text-purple-500">
//                     <Info size={20} />
//                   </div>
//                   <div>
//                     <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">
//                       Status
//                     </p>
//                     <p className="text-sm font-bold text-purple-700 uppercase">
//                       {detailsModal.order.status || "Abandoned Cart"}
//                     </p>
//                     <p className="text-xs text-gray-500">
//                       via {detailsModal.order.source}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Items Table */}
//               <div className="border border-gray-100 rounded-xl overflow-hidden">
//                 <table className="w-full text-left">
//                   <thead className="bg-[#F9FAFB] text-sm font-medium text-gray-500">
//                     <tr>
//                       <th className="px-4 py-3">Product</th>
//                       <th className="px-4 py-3 text-center">Price</th>
//                       <th className="px-4 py-3 text-center">Qty</th>
//                       <th className="px-4 py-3 text-right">Total</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-50">
//                     {(isIncompleteTab
//                       ? detailsModal.order.cart_items
//                       : detailsModal.order.order_items || []
//                     ).map(
//                       (
//                         item: {
//                           productId: string;
//                           product_name: string;
//                           externalName: string;
//                           product: {
//                             id: string;
//                             images: string[];
//                           };
//                           external_image: string;
//                           quantity: number;
//                           price: number;
//                           amount: number;
//                           variant?: {
//                             images?: string[];
//                             sku?: string;
//                             unit?: string;
//                           };
//                           image?: string;
//                           unit_price?: number;
//                           qty?: number;
//                         },
//                         idx: number,
//                       ) => {
//                         // --- RESOLUTION LOGIC ---
//                         // Look up the fetched data from our useQueries map
//                         const resolvedProduct =
//                           productDetailsMap[item.productId || item.product?.id];

//                         // Determine the Name: Resolved > Saved Name > Placeholder
//                         const name =
//                           resolvedProduct?.name ||
//                           item.product_name ||
//                           item.externalName ||
//                           "Loading Product...";

//                         // Determine the Image: Variant Image > Product Resolved > Saved Image > Placeholder
//                         const img =
//                           item.variant?.images?.[0] ||
//                           resolvedProduct?.featuredImage ||
//                           resolvedProduct?.images?.[0] ||
//                           item.image ||
//                           item.product?.images?.[0];

//                         const price = Number(
//                           item.price ||
//                             item.unit_price ||
//                             resolvedProduct?.sell_price ||
//                             0,
//                         );
//                         const qty = Number(item.quantity || item.qty || 1);

//                         return (
//                           <tr
//                             key={idx}
//                             className="text-sm hover:bg-gray-50 transition-all"
//                           >
//                             <td className="px-4 py-3 flex items-center gap-3">
//                               <div className="relative w-10 h-10">
//                                 {/* If loading, show a small spinner overlay on the image area */}
//                                 {resolvedModalProducts[idx]?.isLoading && (
//                                   <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 rounded-md">
//                                     <Loader2
//                                       size={12}
//                                       className="animate-spin text-blue-500"
//                                     />
//                                   </div>
//                                 )}
//                                 <Image
//                                   src={getImgUrl(img)}
//                                   className={`w-10 h-10 rounded-md border object-cover transition-opacity ${resolvedModalProducts[idx]?.isLoading ? "opacity-30" : "opacity-100"}`}
//                                   width={40}
//                                   height={40}
//                                   alt="product"
//                                   unoptimized
//                                 />
//                               </div>
//                               <div className="flex flex-col">
//                                 <span className="font-bold text-gray-700">
//                                   {name}
//                                 </span>
//                                 {resolvedProduct?.sku && (
//                                   <span className="text-[10px] text-gray-400">
//                                     SKU: {resolvedProduct.sku}
//                                   </span>
//                                 )}
//                               </div>
//                             </td>
//                             <td className="px-4 py-3 text-center font-poppins">
//                               ৳{price}
//                             </td>
//                             <td className="px-4 py-3 text-center font-bold font-poppins">
//                               {qty}
//                             </td>
//                             <td className="px-4 py-3 text-right font-bold text-[#1DA1F2] font-poppins">
//                               ৳{price * qty}
//                             </td>
//                           </tr>
//                         );
//                       },
//                     )}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Financial Summary */}
//               <div className="flex flex-col md:flex-row justify-between gap-6 pt-6 mt-4">
//                 <div className="flex-1 bg-gray-50 p-4 rounded-xl">
//                   <p className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-tighter">
//                     Internal Note
//                   </p>
//                   <p className="text-sm text-gray-600 italic">
//                     {detailsModal.order.customer_note || "No notes available."}
//                   </p>
//                 </div>
//                 <div className="w-full md:w-80 space-y-2">
//                   <div className="flex justify-between text-sm text-gray-500">
//                     <span>Subtotal</span>
//                     <span className="font-bold text-black">
//                       ৳
//                       {(isIncompleteTab
//                         ? detailsModal.order.cart_items
//                         : detailsModal.order.order_items || []
//                       ).reduce(
//                         (
//                           sum: number,
//                           i: {
//                             unit_price: number | string;
//                             price: number | string;
//                             quantity: number | string;
//                             qty: number | string;
//                           },
//                         ) =>
//                           sum +
//                           Number(i.unit_price || i.price || 0) *
//                             Number(i.quantity || i.qty || 1),
//                         0,
//                       )}
//                     </span>
//                   </div>
//                   {Number(detailsModal.order.discount_amount || 0) > 0 && (
//                     <div className="flex justify-between text-sm text-gray-500">
//                       <span>Discount</span>
//                       <span className="font-bold text-rose-500">
//                         -৳{Number(detailsModal.order.discount_amount || 0)}
//                       </span>
//                     </div>
//                   )}
//                   {Number(detailsModal.order.shipping_fee || 0) > 0 && (
//                     <div className="flex justify-between text-sm text-gray-500">
//                       <span>Shipping Fee</span>
//                       <span className="font-bold text-black">
//                         ৳{Number(detailsModal.order.shipping_fee || 0)}
//                       </span>
//                     </div>
//                   )}
//                   {Number(detailsModal.order.advance_amount || 0) > 0 && (
//                     <div className="flex justify-between text-sm text-gray-500">
//                       <span>Advance Pay</span>
//                       <span className="font-bold text-emerald-500">
//                         ৳{Number(detailsModal.order.advance_amount || 0)}
//                       </span>
//                     </div>
//                   )}
//                   <div className="flex justify-between text-lg font-bold text-[#023337] border-t border-dashed pt-2 mt-2">
//                     <span>
//                       {detailsModal.order.order_number
//                         ? "Total Due"
//                         : "Estimated Total"}
//                     </span>
//                     <span>
//                       ৳
//                       {detailsModal.order.total_amount_due ||
//                         detailsModal.order.total_amount ||
//                         0}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";
import { useState, useRef, useMemo } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useQueries,
} from "@tanstack/react-query";
import {
  Search,
  MoreVertical,
  Edit,
  Printer,
  FileText,
  RefreshCw,
  Trash2,
  ChevronLeft,
  X,
  Loader2,
  User as UserIcon,
  MapPin,
  Package,
  Info,
  Clock,
  CheckCircle2,
  PauseCircle,
  Truck,
  PackageCheck,
  XCircle,
  RotateCcw,
  LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { debounce } from "lodash";
import { toast } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";

import DataTable from "../common/DataTable";
import Pagination2 from "../common/Pagination2";
import TableTabs from "./TableTabs";

import {
  getAllOrdersService,
  updateOrderStatusService,
  fetchOrderCounts,
} from "@/services-api/orderService";
import { useRouter } from "next/navigation";
import { InvoicePrint } from "./InvoicePrint";
import {
  deleteIncompleteOrderService,
  getAllIncompleteOrdersService,
} from "@/services-api/incompleteOrderService";
import { apiFetch } from "@/utils/api";

/* ------------------------------------------------------------------ */
/*  TYPES / INTERFACES                                                 */
/*  (এই ব্লকটা আদর্শভাবে @/@types/order.type.ts এ রাখা উচিত এবং        */
/*  Order/Customer import করে ব্যবহার করা উচিত, যেন পুরো অ্যাপে একই    */
/*  shape সবখানে থাকে। এখানে দেখানোর জন্য একসাথে রাখা হলো।)            */
/* ------------------------------------------------------------------ */

// একটা variant এর ভেতরের তথ্য (order_items / cart_items দুটোতেই আসে)
interface ProductVariant {
  images?: string[];
  sku?: string;
  unit?: string;
}

// পণ্যের বেসিক তথ্য (order_items এর ভেতরে nested product)
interface ProductInfo {
  id?: string;
  name?: string;
  images?: string[];
  featuredImage?: string;
}

// useQueries দিয়ে /products/:id থেকে যেটা resolve হয় (Incomplete/lead modal এর জন্য)
interface ProductMetadata {
  id: string;
  name?: string;
  images?: string[];
  featuredImage?: string;
  sku?: string;
  sell_price?: number;
}

// order_items এবং cart_items দুটোই backend এ আলাদা shape এ আসে,
// কিন্তু UI তে একই ভাবে render হয় — তাই একটা কমন LineItem টাইপ।
interface LineItem {
  id?: string;
  productId?: string; // cart_items (incomplete order) এ থাকে
  variantId?: string; // cart_items এ থাকে
  product_name?: string; // order_items এ থাকে
  externalName?: string; // guest/external checkout item name
  image?: string;
  externalImage?: string;
  external_image?: string;
  quantity?: number | string;
  qty?: number | string;
  price?: number | string;
  unit_price?: number | string;
  product?: ProductInfo;
  variant?: ProductVariant;
}

interface CustomerProfile {
  phone?: string;
  email?: string;
  avatar?: string;
  image?: string;
}

interface OrderCustomer {
  id?: string;
  name?: string;
  profile?: CustomerProfile;
  avatar?: string;
}

interface OrderUser {
  profile?: {
    image?: string;
  };
}

// মূল Order/Lead object — order_items ও cart_items দুটোই optional,
// কারণ Incomplete order এ cart_items থাকে, রেগুলার order এ order_items.
interface Order {
  id: string;
  order_number?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_image?: string;
  customer_address?: string;
  customer_note?: string;
  source?: string;
  user_id?: string;
  order_items?: LineItem[];
  cart_items?: LineItem[];
  status?: string;
  payment_status?: string;
  shipping_fee?: number | string;
  discount_amount?: number | string;
  advance_amount?: number | string;
  amount?: number;
  total_amount?: number | string;
  total_amount_due?: number | string;
  total_bill?: number;
  totalDue?: number | string;
  created_at?: string;
  customer?: OrderCustomer;
  user?: OrderUser;
}

// action menu-তে যে কনট্যাক্ট কার্ড দেখানো হয় সেটার জন্য (আগের নাম `User`
// ছিল, যেটা lucide-react এর `User` icon import এর সাথে collide করছিল)
interface CustomerContact {
  avatar?: string;
  name?: string;
  phone?: string;
}

interface PaginationMeta {
  totalPages: number;
  total: number;
}

interface OrdersApiResponse {
  data?: {
    data?: Order[];
    meta?: PaginationMeta;
  };
  meta?: PaginationMeta;
}

interface TabCount {
  tab: string;
  count: number;
}

interface StatusConfig {
  label: string;
  icon: LucideIcon;
  className: string;
  iconColor: string;
}

interface MenuPosition {
  top: number;
  left: number;
  opensUpward: boolean;
}

interface ShippedModalState {
  open: boolean;
  id: string | null;
}

interface DetailsModalState {
  open: boolean;
  order: Order | null;
}

/* ------------------------------------------------------------------ */

const getStatusConfig = (status: string | undefined): StatusConfig => {
  // 🚀 Safe check to prevent "Cannot read properties of undefined (reading 'replace')"
  if (!status) {
    return {
      label: "Unknown",
      icon: Info,
      className: "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100",
      iconColor: "text-gray-400",
    };
  }

  const upper = status.toUpperCase();
  switch (upper) {
    case "PENDING":
      return {
        label: "Pending",
        icon: Clock,
        className:
          "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
        iconColor: "text-amber-500",
      };
    case "CONFIRMED":
      return {
        label: "Confirmed",
        icon: CheckCircle2,
        className:
          "bg-blue-50 text-[#1DA1F2] border-blue-200 hover:bg-blue-100",
        iconColor: "text-[#1DA1F2]",
      };
    case "ON_HOLD":
      return {
        label: "On Hold",
        icon: PauseCircle,
        className:
          "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
        iconColor: "text-orange-500",
      };
    case "SHIPPED":
      return {
        label: "Shipped",
        icon: Truck,
        className:
          "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
        iconColor: "text-purple-500",
      };
    case "SENT_TO_COURIER":
      return {
        label: "Sent to Courier",
        icon: Truck,
        className:
          "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100",
        iconColor: "text-indigo-500",
      };
    case "DELIVERED":
      return {
        label: "Delivered",
        icon: PackageCheck,
        className:
          "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
        iconColor: "text-emerald-500",
      };
    case "CANCELED":
      return {
        label: "Canceled",
        icon: XCircle,
        className: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
        iconColor: "text-rose-500",
      };
    case "RETURNED":
      return {
        label: "Returned",
        icon: RotateCcw,
        className:
          "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200",
        iconColor: "text-gray-500",
      };
    case "REFUNDED":
      return {
        label: "Refunded",
        icon: RefreshCw,
        className: "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100",
        iconColor: "text-teal-500",
      };
    default:
      return {
        label: status.replace(/_/g, " "),
        icon: Info,
        className: "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100",
        iconColor: "text-gray-400",
      };
  }
};

export default function OrderTable() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const tabs: string[] = [
    "All order",
    "Pending",
    "Confirmed",
    "Incomplete",
    "Delivered",
    "Canceled",
    "Returned",
  ];

  // Helper logic to prevent routing errors
  const isIncompleteTab = tabs[activeTab] === "Incomplete";

  // Action Menu States
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<MenuPosition>({
    top: 0,
    left: 0,
    opensUpward: false,
  });
  const [showStatusMenu, setShowStatusMenu] = useState<boolean>(false);

  // Modal States
  const [shippedModal, setShippedModal] = useState<ShippedModalState>({
    open: false,
    id: null,
  });
  const [detailsModal, setDetailsModal] = useState<DetailsModalState>({
    open: false,
    order: null,
  });

  const [selectedOrderForPrint, setSelectedOrderForPrint] =
    useState<Order | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
  });

  const baseStorageUrl: string =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8083";

  // --- HELPERS ---
  const openDetails = (order: Order): void => {
    setDetailsModal({ open: true, order });
    setActiveMenuId(null);
  };

  // 1. Identify the products that need to be fetched for the modal
  const modalItems: LineItem[] = useMemo(() => {
    if (!detailsModal.open || !detailsModal.order || !isIncompleteTab)
      return [];
    return detailsModal.order.cart_items || [];
  }, [detailsModal.open, detailsModal.order, isIncompleteTab]);

  // 2. Fetch details for each item
  const resolvedModalProducts = useQueries({
    queries: modalItems.map((item) => ({
      queryKey: ["product-metadata", item.productId],
      queryFn: async (): Promise<ProductMetadata> => {
        const res = await apiFetch(`/products/${item.productId}`, {
          method: "GET",
        });
        const json = await res.json();
        return (json.data || json) as ProductMetadata;
      },
      enabled: detailsModal.open && !!item.productId,
    })),
  });

  // 3. Build a lookup map keyed by product id
  const productDetailsMap: Record<string, ProductMetadata> = useMemo(() => {
    const map: Record<string, ProductMetadata> = {};
    resolvedModalProducts.forEach((query) => {
      const product = query.data;
      if (product && product.id) {
        map[product.id] = product;
      }
    });
    return map;
  }, [resolvedModalProducts]);

  const getImgUrl = (rawImg: string | undefined | null): string => {
    const cleanImg = typeof rawImg === "string" ? rawImg.trim() : "";
    return cleanImg !== ""
      ? cleanImg.startsWith("http")
        ? cleanImg
        : `${baseStorageUrl}/${cleanImg.replace(/^\/+/, "")}`
      : "/images/products/product2.png";
  };

  const fetchedCustomer: CustomerContact | null = detailsModal.order
    ? {
        avatar:
          detailsModal.order.customer_image ||
          detailsModal.order.customer?.profile?.image ||
          detailsModal.order.customer?.avatar ||
          undefined,
        name: detailsModal.order.customer_name,
        phone: detailsModal.order.customer_phone,
      }
    : null;

  // --- FETCH DATA ---
  const { data: serverData, isLoading } = useQuery<OrdersApiResponse>({
    queryKey: ["admin-orders", tabs[activeTab], page, searchQuery],
    queryFn: async () => {
      if (isIncompleteTab) {
        // Hits: /incomplete-orders -> Returns { meta, data }
        return await getAllIncompleteOrdersService({ page, limit: 10 });
      }

      // Hits: /orders -> Returns { data: { meta, data } }
      const status =
        tabs[activeTab] === "All order" ? "" : tabs[activeTab].toUpperCase();
      return await getAllOrdersService({
        page,
        limit: 10,
        status,
        search: searchQuery,
        refresh: true,
      });
    },
    // This keeps the UI stable while switching tabs
    placeholderData: (previousData) => previousData,
  });

  // 🚀 Universal Data Extractor
  // এই লজিক API response এর যেকোনো shape থেকে array [...] বের করে আনে
  const orderList: Order[] = useMemo(() => {
    if (!serverData) return [];

    // 1. Regular Order structure: serverData.data.data
    if (serverData.data && Array.isArray(serverData.data.data)) {
      return serverData.data.data;
    }

    // 2. Incomplete Order structure: serverData.data
    if (Array.isArray(serverData.data)) {
      return serverData.data as unknown as Order[];
    }

    // 3. Fallback if the whole object is the array (unlikely but safe)
    if (Array.isArray(serverData)) {
      return serverData as unknown as Order[];
    }

    return []; // Always return an array to prevent .map() crash
  }, [serverData]);

  // 🚀 Universal Meta Extractor
  const meta: PaginationMeta = useMemo(() => {
    const m = serverData?.data?.meta || serverData?.meta;
    return m || { totalPages: 1, total: 0 };
  }, [serverData]);

  // --- FIXED FETCH TAB COUNTS ---
  const { data: tabCountsData } = useQuery<TabCount[]>({
    queryKey: ["order-tab-counts"],
    queryFn: async () => {
      // 1. Fetch standard counts from the regular Order Service
      const standardTabs = tabs.filter((t) => t !== "Incomplete");
      const standardCounts: TabCount[] = await fetchOrderCounts(standardTabs);

      // 2. Fetch Incomplete count from the Incomplete Order Service
      // We set limit to 1 because we only care about the meta.total field
      let incompleteCount = 0;
      try {
        const leadRes = await getAllIncompleteOrdersService({
          page: 1,
          limit: 1,
        });
        // Based on your backend, total is inside meta
        incompleteCount =
          leadRes?.meta?.total || leadRes?.data?.meta?.total || 0;
      } catch (e) {
        console.error("Failed to fetch incomplete counts", e);
      }

      // 3. Return the merged array
      return [...standardCounts, { tab: "Incomplete", count: incompleteCount }];
    },
    refetchOnWindowFocus: true,
  });

  // এটা array কে Map এ কনভার্ট করে যাতে UI সহজে count খুঁজে পায়
  const counts: Record<string, number> = useMemo(() => {
    return (
      tabCountsData?.reduce<Record<string, number>>(
        (acc, curr) => ({
          ...acc,
          [curr.tab]: curr.count,
        }),
        {},
      ) || {}
    );
  }, [tabCountsData]);

  // --- MUTATIONS ---
  const statusMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        status: string;
        payment_status?: string;
      };
    }) => updateOrderStatusService(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-tab-counts"] });
      toast.success("Sync successful.");
      setActiveMenuId(null);
      setShippedModal({ open: false, id: null });
    },
  });

  const handleSearch = debounce((val: string) => {
    setSearchQuery(val);
    setPage(1);
  }, 500);

  const deleteLeadMutation = useMutation({
    mutationFn: (id: string) => deleteIncompleteOrderService(id),
    onSuccess: () => {
      // Refresh the list and the counts
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-tab-counts"] });
      toast.success("Lead removed successfully");
      setActiveMenuId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete");
    },
  });

  // Helper: item list অনুযায়ী মোট subtotal বের করা (order_items বা cart_items)
  const sumLineItems = (items: LineItem[]): number =>
    items.reduce(
      (sum, i) =>
        sum +
        Number(i.unit_price || i.price || 0) * Number(i.quantity || i.qty || 1),
      0,
    );

  // --- COLUMNS ---
  const columns = [
    {
      header: isIncompleteTab ? "Lead ID" : "Order Id",
      key: "id",
      render: (item: Order) => (
        <span
          onClick={() => openDetails(item)}
          className="font-medium text-[14px] cursor-pointer hover:text-[#1DA1F2] transition-colors"
        >
          {isIncompleteTab
            ? `LEAD-${item.id.slice(0, 8)}`
            : `#${item.order_number}`}
        </span>
      ),
    },
    {
      header: "Product",
      key: "product",
      render: (item: Order) => {
        const items: LineItem[] = isIncompleteTab
          ? item.cart_items || []
          : item.order_items || [];
        const firstItem = items[0];

        const productInfo = firstItem?.product || {};
        const variantInfo = firstItem?.variant || {};

        // Prioritize variant image, then product image, then fallbacks
        const img =
          variantInfo.images?.[0] ||
          productInfo.images?.[0] ||
          productInfo.featuredImage ||
          firstItem?.image ||
          firstItem?.externalImage;

        const name =
          productInfo.name ||
          firstItem?.product_name ||
          firstItem?.externalName ||
          (isIncompleteTab ? "Guest Item" : "Untitled");

        return (
          <div
            onClick={() => openDetails(item)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <Image
              src={getImgUrl(img)}
              alt="product"
              width={40}
              height={40}
              unoptimized
              className="rounded-lg object-cover bg-gray-50 p-1 group-hover:border-[#1DA1F2] transition-all"
            />
            <div className="flex flex-col">
              <span className="truncate max-w-[150px] text-[14px] font-medium text-black group-hover:text-[#1DA1F2] transition-colors">
                {name}
              </span>
              {items.length > 1 && (
                <span className="text-[10px] text-[#1DA1F2] font-bold">
                  +{items.length - 1} more items
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: "Customer",
      key: "customer",
      render: (item: Order) => (
        <div onClick={() => openDetails(item)} className="cursor-pointer">
          <p className="font-medium text-[14px] text-black">
            {item.customer_name || "Anonymous Guest"}
          </p>
          <p className="text-[12px] text-gray-500">
            {item.customer_phone || "No Phone"}
          </p>
        </div>
      ),
    },
    {
      header: "Amount",
      key: "amount",
      render: (item: Order) => {
        const items: LineItem[] = item.order_items || item.cart_items || [];
        const subtotal = sumLineItems(items);
        const shipping = Number(item.shipping_fee || 0);
        const discount = Number(item.discount_amount || 0);

        // Actual Order Amount = Subtotal + Shipping Fee - Discount
        const totalValue = isIncompleteTab
          ? Number(item.total_amount)
          : subtotal + shipping - discount;

        return (
          <div
            onClick={() => openDetails(item)}
            className="cursor-pointer space-y-0.5"
          >
            <span className="font-semibold text-[14px] text-black block">
              ৳{totalValue || 0}
            </span>
            {isIncompleteTab && (
              <span className="text-[10px] text-gray-400">Potential Sale</span>
            )}
          </div>
        );
      },
    },
    {
      header: "Status",
      key: "status",
      render: (item: Order) => {
        if (isIncompleteTab) {
          return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[13px] font-semibold bg-gray-50 text-gray-400 border-gray-200">
              <Clock size={15} />
              <span>Abandoned</span>
            </div>
          );
        }
        const config = getStatusConfig(item.status);
        const IconComponent = config.icon;
        return (
          <div
            onClick={() => openDetails(item)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[13px] font-semibold transition-all ${config.className}`}
          >
            <IconComponent size={15} className={config.iconColor} />
            <span className="capitalize">{config.label}</span>
          </div>
        );
      },
    },
    {
      header: "Action",
      key: "action",
      render: (order: Order) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            setMenuPos({
              top: rect.bottom + 8,
              left: rect.left - 165,
              opensUpward: false,
            });
            setActiveMenuId(activeMenuId === order.id ? null : order.id);
            setShowStatusMenu(false);
          }}
          className="p-1 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
        >
          <MoreVertical size={20} />
        </button>
      ),
    },
  ];

  if (isLoading)
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-2">
        <Loader2 className="animate-spin text-[#1DA1F2]" />
        <span className="text-xs text-gray-400">Loading order dataset...</span>
      </div>
    );

  return (
    <div className="w-full font-lato">
      <div className="bg-white rounded-lg mt-4 relative">
        <div className="p-4 flex flex-col lg:flex-row justify-between items-center gap-4">
          <TableTabs
            tabs={tabs.map((t) => `${t} (${counts[t] || 0})`)}
            activeTab={activeTab}
            setActiveTab={(idx: number) => {
              setActiveTab(idx);
              setPage(1);
            }}
          />

          {/* --- CONDITIONALLY HIDE SEARCH BAR --- */}
          {!isIncompleteTab && (
            <div className="relative flex-grow lg:w-[316px] animate-in fade-in duration-200">
              <input
                type="text"
                placeholder="Search orders..."
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-[#F9FAFB] rounded-lg py-2.5 pl-4 pr-10 text-[14px] text-black border border-transparent focus:ring-2 focus:ring-[#1DA1F2]/30 focus:border-[#1DA1F2] outline-none transition-all"
              />
              <Search
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
          )}
        </div>

        <DataTable data={orderList} columns={columns} rowKey="id" />

        <div className="py-5">
          <Pagination2
            currentPage={page}
            totalPages={meta.totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* --- MODIFIED ACTION MENU --- */}
      {activeMenuId && (
        <div
          ref={menuRef}
          className="fixed bg-white border border-gray-100 rounded-xl shadow-2xl py-2 z-[9999] w-[210px] animate-in fade-in zoom-in duration-150"
          style={{ top: menuPos.top, left: menuPos.left }}
        >
          {/* Group 1: Core Actions (Hidden for Incomplete) */}
          {!isIncompleteTab && (
            <div className="px-2 pb-1.5 border-b border-gray-50 mb-1.5">
              <button
                onClick={() =>
                  router.push(`/admin/dashboard/order/add?id=${activeMenuId}`)
                }
                className="w-full text-left px-3 py-2 text-[14px] text-gray-600 hover:bg-blue-50 hover:text-[#1DA1F2] rounded-lg flex items-center gap-3 transition-colors group"
              >
                <Edit
                  size={16}
                  className="text-gray-400 group-hover:text-[#1DA1F2]"
                />
                <span className="font-medium">Edit Order</span>
              </button>
            </div>
          )}

          {/* Group 2: View & Output (Conditional Print) */}
          <div className="px-2 pb-1.5 border-b border-gray-50 mb-1.5">
            {!isIncompleteTab && (
              <button
                onClick={() => {
                  const o = orderList.find((x) => x.id === activeMenuId);
                  if (!o) return;
                  setSelectedOrderForPrint(o);
                  setActiveMenuId(null);
                  setTimeout(() => {
                    handlePrint();
                  }, 100);
                }}
                className="w-full text-left px-3 py-2 text-[14px] text-gray-600 hover:bg-blue-50 hover:text-[#1DA1F2] rounded-lg flex items-center gap-3 transition-colors group"
              >
                <Printer
                  size={16}
                  className="text-gray-400 group-hover:text-[#1DA1F2]"
                />
                <span className="font-medium">Print Invoice</span>
              </button>
            )}

            <button
              onClick={() => {
                const o = orderList.find((x) => x.id === activeMenuId);
                if (o) openDetails(o);
              }}
              className="w-full text-left px-3 py-2 text-[14px] text-gray-600 hover:bg-blue-50 hover:text-[#1DA1F2] rounded-lg flex items-center gap-3 transition-colors group"
            >
              <FileText
                size={16}
                className="text-gray-400 group-hover:text-[#1DA1F2]"
              />
              <span className="font-medium">View Details</span>
            </button>
          </div>

          {/* Group 3: Status Management (Hidden for Incomplete) */}
          {!isIncompleteTab && (
            <div className="px-2 pb-1.5 border-b border-gray-50 mb-1.5">
              <div className="relative group/status">
                <button
                  onMouseEnter={() => setShowStatusMenu(true)}
                  className="w-full flex items-center justify-between px-3 py-2 text-[14px] text-gray-600 hover:bg-blue-50 hover:text-[#1DA1F2] rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <RefreshCw size={16} className="text-gray-400" />
                    <span className="font-medium">Update Status</span>
                  </div>
                  <ChevronLeft size={14} className="opacity-50" />
                </button>

                {showStatusMenu && (
                  <div className="absolute right-full mr-2 w-[180px] bg-white border border-gray-100 rounded-xl shadow-2xl py-2 z-[10000]">
                    {(
                      [
                        "PENDING",
                        "CONFIRMED",
                        "ON_HOLD",
                        "SHIPPED",
                        "DELIVERED",
                        "CANCELED",
                      ] as const
                    ).map((s) => (
                      <button
                        key={s}
                        onClick={() =>
                          activeMenuId &&
                          statusMutation.mutate({
                            id: activeMenuId,
                            payload: { status: s },
                          })
                        }
                        className="w-full text-left px-4 py-1.5 text-[13px] text-gray-700 hover:bg-blue-50 hover:text-[#1DA1F2]"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Group 4: Dangerous Actions */}
          <div className="px-2">
            <button
              onClick={() => {
                if (!activeMenuId) return;

                // Confirmation dialog for professionalism
                const msg = isIncompleteTab
                  ? "Are you sure you want to delete this incomplete lead?"
                  : "Are you sure you want to delete this order?";

                if (window.confirm(msg)) {
                  if (isIncompleteTab) {
                    deleteLeadMutation.mutate(activeMenuId);
                  } else {
                    // If you have a regular order delete mutation, call it here
                    // orderDeleteMutation.mutate(activeMenuId);
                    toast.error("Order deletion not implemented yet.");
                  }
                }
              }}
              className="w-full text-left px-3 py-2.5 text-[14px] text-rose-500 hover:bg-rose-50 rounded-lg flex items-center gap-3 transition-colors font-bold cursor-pointer"
            >
              {deleteLeadMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              <span>
                {deleteLeadMutation.isPending
                  ? "Deleting..."
                  : `Delete ${isIncompleteTab ? "Lead" : "Order"}`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Hidden component for printing */}
      <div className="hidden">
        <InvoicePrint
          ref={invoiceRef}
          order={selectedOrderForPrint}
          baseStorageUrl={baseStorageUrl}
        />
      </div>

      {/* --- DETAILS MODAL --- */}
      {detailsModal.open && detailsModal.order && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10001] p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden font-lato flex flex-col text-left">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-[#F9FAFB]">
              <div className="flex items-center gap-3">
                <div className="bg-[#1DA1F2]/10 p-2 rounded-lg text-[#1DA1F2]">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#023337]">
                    {detailsModal.order.cart_items
                      ? "Incomplete Lead Details"
                      : "Order Summary"}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    {detailsModal.order.order_number
                      ? `#${detailsModal.order.order_number}`
                      : `LEAD-${detailsModal.order.id.slice(0, 8)}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailsModal({ open: false, order: null })}
                className="p-2 hover:bg-gray-200 rounded-full cursor-pointer transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Customer Card */}
                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-start gap-4">
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden flex-shrink-0 w-11 h-11 flex items-center justify-center">
                    {fetchedCustomer?.avatar ? (
                      <Image
                        src={getImgUrl(fetchedCustomer.avatar)}
                        className="w-full h-full object-cover"
                        width={44}
                        height={44}
                        alt="avatar"
                        unoptimized
                      />
                    ) : (
                      <div className="text-blue-500">
                        <UserIcon size={20} />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                      Contact
                    </p>
                    <p className="font-bold text-[#023337]">
                      {detailsModal.order.customer_name || "Guest"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {detailsModal.order.customer_phone || "No Phone"}
                    </p>
                  </div>
                </div>

                <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl flex items-start gap-4">
                  <div className="bg-white p-2 rounded-lg shadow-sm text-emerald-500">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Address
                    </p>
                    <p className="text-sm font-medium text-gray-700 leading-tight">
                      {detailsModal.order.customer_address ||
                        "No address provided"}
                    </p>
                  </div>
                </div>

                <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-xl flex items-start gap-4">
                  <div className="bg-white p-2 rounded-lg shadow-sm text-purple-500">
                    <Info size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                      Status
                    </p>
                    <p className="text-sm font-bold text-purple-700 uppercase">
                      {detailsModal.order.status || "Abandoned Cart"}
                    </p>
                    <p className="text-xs text-gray-500">
                      via {detailsModal.order.source}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-[#F9FAFB] text-sm font-medium text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3 text-center">Price</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(
                      (isIncompleteTab
                        ? detailsModal.order.cart_items
                        : detailsModal.order.order_items) || []
                    ).map((item: LineItem, idx: number) => {
                      // --- RESOLUTION LOGIC ---
                      const resolvedProduct =
                        productDetailsMap[
                          item.productId || item.product?.id || ""
                        ];

                      // Name: Resolved > Saved Name > Placeholder
                      const name =
                        resolvedProduct?.name ||
                        item.product_name ||
                        item.externalName ||
                        "Loading Product...";

                      // Image: Variant > Product Resolved > Saved > Fallback
                      const img =
                        item.variant?.images?.[0] ||
                        resolvedProduct?.featuredImage ||
                        resolvedProduct?.images?.[0] ||
                        item.image ||
                        item.product?.images?.[0];

                      const price = Number(
                        item.price ||
                          item.unit_price ||
                          resolvedProduct?.sell_price ||
                          0,
                      );
                      const qty = Number(item.quantity || item.qty || 1);

                      return (
                        <tr
                          key={idx}
                          className="text-sm hover:bg-gray-50 transition-all"
                        >
                          <td className="px-4 py-3 flex items-center gap-3">
                            <div className="relative w-10 h-10">
                              {/* If loading, show a small spinner overlay on the image area */}
                              {resolvedModalProducts[idx]?.isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 rounded-md">
                                  <Loader2
                                    size={12}
                                    className="animate-spin text-blue-500"
                                  />
                                </div>
                              )}
                              <Image
                                src={getImgUrl(img)}
                                className={`w-10 h-10 rounded-md border object-cover transition-opacity ${resolvedModalProducts[idx]?.isLoading ? "opacity-30" : "opacity-100"}`}
                                width={40}
                                height={40}
                                alt="product"
                                unoptimized
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-700">
                                {name}
                              </span>
                              {resolvedProduct?.sku && (
                                <span className="text-[10px] text-gray-400">
                                  SKU: {resolvedProduct.sku}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center font-poppins">
                            ৳{price}
                          </td>
                          <td className="px-4 py-3 text-center font-bold font-poppins">
                            {qty}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-[#1DA1F2] font-poppins">
                            ৳{price * qty}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Financial Summary */}
              <div className="flex flex-col md:flex-row justify-between gap-6 pt-6 mt-4">
                <div className="flex-1 bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-tighter">
                    Internal Note
                  </p>
                  <p className="text-sm text-gray-600 italic">
                    {detailsModal.order.customer_note || "No notes available."}
                  </p>
                </div>
                <div className="w-full md:w-80 space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-bold text-black">
                      ৳
                      {sumLineItems(
                        (isIncompleteTab
                          ? detailsModal.order.cart_items
                          : detailsModal.order.order_items) || [],
                      )}
                    </span>
                  </div>
                  {Number(detailsModal.order.discount_amount || 0) > 0 && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Discount</span>
                      <span className="font-bold text-rose-500">
                        -৳{Number(detailsModal.order.discount_amount || 0)}
                      </span>
                    </div>
                  )}
                  {Number(detailsModal.order.shipping_fee || 0) > 0 && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Shipping Fee</span>
                      <span className="font-bold text-black">
                        ৳{Number(detailsModal.order.shipping_fee || 0)}
                      </span>
                    </div>
                  )}
                  {Number(detailsModal.order.advance_amount || 0) > 0 && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Advance Pay</span>
                      <span className="font-bold text-emerald-500">
                        ৳{Number(detailsModal.order.advance_amount || 0)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-[#023337] border-t border-dashed pt-2 mt-2">
                    <span>
                      {detailsModal.order.order_number
                        ? "Total Due"
                        : "Estimated Total"}
                    </span>
                    <span>
                      ৳
                      {detailsModal.order.total_amount_due ||
                        detailsModal.order.total_amount ||
                        0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
