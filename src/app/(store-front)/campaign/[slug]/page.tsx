"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FaChevronRight, FaTag, FaClock } from "react-icons/fa";
import { fetchCampaignByIdOrSlug } from "@/services-api/campaignService";
import ProductCard from "@/components/store-front/common/ProductCard";
import { Product } from "@/@types/product.type";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";

interface CampaignDetailsData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  banner_url?: string | null;
  discount_value?: string | number;
  min_order_amount?: string | number;
  is_free_delivery?: boolean;
  status?: string;
  products?: Product[];
  campaign_products?: { product_id: string; product?: Product }[];
}

interface CampaignApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: CampaignDetailsData;
}

export default function SingleCampaignPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { language } = useLanguage();
  const t = translations[language];

  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  const {
    data: apiResponse,
    isLoading,
    isError,
  } = useQuery<CampaignApiResponse>({
    queryKey: ["campaign-details", slug],
    queryFn: async () => {
      const res = await fetchCampaignByIdOrSlug(slug);
      return res as unknown as CampaignApiResponse;
    },
    enabled: !!slug,
  });

  const rawCampaign = (apiResponse as unknown as CampaignApiResponse)?.data?.id
    ? (apiResponse as unknown as CampaignApiResponse).data
    : (apiResponse as unknown as CampaignApiResponse)?.data ||
      (apiResponse as unknown as CampaignApiResponse);
  const campaign = rawCampaign as unknown as CampaignDetailsData | undefined;

  const rawProducts: Product[] = (
    (campaign?.products && campaign.products.length > 0
      ? campaign.products
      : campaign?.campaign_products
          ?.map((cp: { product?: Product }) => cp.product || cp)
          .filter(Boolean)) || []
  ).filter((p): p is Product => Boolean(p));

  const products: Product[] = rawProducts.map((p) => {
    const discountVal = campaign?.discount_value
      ? Number(campaign.discount_value)
      : 0;

    if (!p.campaign_discount && discountVal > 0) {
      const sellPrice = parseFloat(String(p.sell_price)) || 0;
      const calculatedFinal = Math.round(sellPrice * (1 - discountVal / 100));
      return {
        ...p,
        campaign_discount: {
          discount_value: discountVal,
          campaign_name: campaign?.name,
          campaign_id: campaign?.id,
          is_free_delivery: campaign?.is_free_delivery,
        } as Product["campaign_discount"],
        final_price: p.final_price ?? calculatedFinal,
      };
    }
    return p;
  });

  // Helper to format image URL
  const getImageUrl = (rawUrl?: string | null): string => {
    if (!rawUrl || rawUrl.trim().length <= 1) return "/images/placeholder.svg";
    return rawUrl.startsWith("http") || rawUrl.startsWith("/images/")
      ? rawUrl
      : `${backendBaseUrl}/${rawUrl.replace(/^\/+/, "")}`;
  };

  // Helper to format end date
  const formatDate = (dateStr?: string): string | null => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(
        (language as string) === "bn" ? "bn-BD" : "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        },
      );
    } catch {
      return null;
    }
  };

  return (
    <div className="px-4 md:px-10 mb-20 font-poppins">
      <div className="max-w-[1720px] mx-auto">
        {/* ── Breadcrumbs ─────────────────────────────────────── */}
        <nav className="py-4 font-poppins font-medium text-sm md:text-base flex items-center gap-2 flex-wrap">
          <Link
            href="/"
            className="text-[#727272] hover:text-[#7CB640] transition-colors"
          >
            Home
          </Link>
          <FaChevronRight color="#7CB640" size={13} />
          <span className="text-[#727272]">Campaigns</span>
          <FaChevronRight color="#7CB640" size={13} />
          <span className="text-[#7CB640] truncate max-w-[200px] md:max-w-none">
            {campaign?.name || "Loading..."}
          </span>
        </nav>

        {/* ── Loading Skeleton ────────────────────────────────── */}
        {isLoading && (
          <div className="space-y-8 animate-pulse">
            <div className="w-full h-[220px] md:h-[320px] bg-gray-200 rounded-[24px] md:rounded-[36px]" />
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-[340px] bg-gray-100 rounded-[16px]" />
              ))}
            </div>
          </div>
        )}

        {/* ── Error / Not Found ───────────────────────────────── */}
        {(isError || (!isLoading && !campaign)) && (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-[#FAFAFA] rounded-[24px] border border-[#E3E3E3] my-8">
            <h2 className="font-poppins text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Campaign Not Found
            </h2>
            <p className="font-poppins text-gray-500 text-sm md:text-base mb-6 max-w-md">
              The requested campaign might have expired or does not exist.
            </p>
            <Link
              href="/"
              className="px-6 py-2.5 bg-[#7CB640] text-white font-poppins font-medium rounded-full hover:bg-[#e66345] transition-all"
            >
              Back to Home
            </Link>
          </div>
        )}

        {/* ── Campaign Content ────────────────────────────────── */}
        {!isLoading && campaign && (
          <>
            {/* Hero Header Card */}
            <div
              className="relative overflow-hidden rounded-lg p-5 sm:p-8 md:p-12 mb-10 md:h-[60vh] h-[40vh]"
              style={{
                backgroundImage: `url("${getImageUrl(campaign.banner_url)}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="flex flex-col lg:flex-row items-center justify-center gap-6 md:gap-10 my-auto h-full">
                {/* Text & Badges */}
                <div className="md:flex-1 text-center lg:text-left space-y-3 md:space-y-4">
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                    {campaign.discount_value !== undefined &&
                      campaign.discount_value !== null && (
                        <span className="inline-flex items-center gap-1.5 bg-[#7CB640] text-white text-xs md:text-sm font-poppins font-semibold px-3 py-1 rounded-lg">
                          <FaTag size={12} />
                          Up to {campaign.discount_value}% OFF
                        </span>
                      )}
                  </div>

                  <h1 className="font-poppins text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black leading-tight">
                    {campaign.name}
                  </h1>

                  {campaign.description && (
                    <p className="font-poppins text-gray-600 text-sm md:text-base max-w-2xl">
                      {campaign.description}
                    </p>
                  )}

                  <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs md:text-sm text-gray-600 font-poppins">
                    {campaign.end_date && formatDate(campaign.end_date) && (
                      <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-xs px-3.5 py-1.5 rounded-lg border border-gray-200">
                        <FaClock className="text-[#7CB640]" />
                        <span>Valid till: </span>
                        <span className="font-semibold text-gray-800">
                          {formatDate(campaign.end_date)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Products Section Header */}
            <div className="flex items-center justify-between mb-6 pb-3">
              <h2 className="font-poppins text-xl md:text-2xl font-medium text-black flex items-center gap-2">
                <span>Campaign Products</span>
                <span className="bg-[#7CB640]/10 text-[#7CB640] text-xs md:text-sm font-semibold px-2.5 py-0.5 rounded-full">
                  {products.length}
                </span>
              </h2>
            </div>
            {/* Products Grid */}
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-[#FAFAFA] rounded-[20px] border border-gray-200">
                <p className="font-poppins text-gray-500 text-base md:text-lg">
                  No products are currently available in this campaign.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {products.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// "use client";
// import Link from "next/link";
// import Image from "next/image";
// import { useParams, useRouter } from "next/navigation";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import {
//   FaChevronRight,
//   FaShippingFast,
//   FaTag,
//   FaClock,
//   FaExclamationTriangle,
//   FaShoppingBasket,
// } from "react-icons/fa";
// import { fetchCampaignByIdOrSlug } from "@/services-api/campaignService";
// import { createCart } from "@/services-api/cartService"; // আপনার দেওয়া সার্ভিস অনুযায়ী
// import { Product } from "@/@types/product.type";
// import { useLanguage } from "@/providers/LanguageProvider";
// import { translations } from "@/locales";
// import toast from "react-hot-toast";
// import { useAuthStore } from "@/store/useAuthStore";

// export default function SingleCampaignPage() {
//   const params = useParams();
//   const router = useRouter();
//   const queryClient = useQueryClient();
//   const slug = params?.slug as string;
//   const user = useAuthStore((state) => state.user);

//   const { language } = useLanguage();
//   const t = translations[language];

//   // ১. ক্যাম্পেইন ডাটা ফেচ করা
//   const {
//     data: apiResponse,
//     isLoading,
//     isError,
//   } = useQuery({
//     queryKey: ["campaign-details", slug],
//     queryFn: () => fetchCampaignByIdOrSlug(slug),
//     enabled: !!slug,
//   });

//   // ২. Order Now মিউটেশন (সরাসরি কার্টে অ্যাড করে চেকআউট এ যাবে)
//   const orderMutation = useMutation({
//     mutationFn: async (product: any) => {
//       const guestId = localStorage.getItem("guestId");
//       return createCart(
//         product.id,
//         1, // Quantity: 1
//         null, // VariantId: null
//         user ? null : guestId, // User না থাকলে GuestId যাবে
//       );
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["cart"] });
//       window.dispatchEvent(new Event("cart_updated")); // Header এ কার্ট কাউন্ট আপডেট করবে
//       router.push("/order"); // চেকআউট পেজে রিডাইরেক্ট
//     },
//     onError: (err: any) => {
//       toast.error(err.message || "Failed to process order");
//     },
//   });

//   const campaign = apiResponse?.data;
//   const products: any[] = campaign?.products || [];
//   const backendBaseUrl =
//     process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
//     "http://localhost:8082";

//   const getImageUrl = (rawUrl?: string | null) => {
//     if (!rawUrl || rawUrl.trim().length <= 1) return "/images/placeholder.svg";
//     return rawUrl.startsWith("http")
//       ? rawUrl
//       : `${backendBaseUrl}/${rawUrl.replace(/^\/+/, "")}`;
//   };

//   if (isLoading)
//     return (
//       <div className="py-20 text-center animate-pulse text-gray-500">
//         Loading Campaign...
//       </div>
//     );

//   if (isError || !campaign) {
//     return (
//       <div className="flex flex-col items-center justify-center py-24 text-center">
//         <FaExclamationTriangle className="text-red-400 text-5xl mb-4" />
//         <h2 className="text-2xl font-bold">Campaign Not Found</h2>
//         <Link href="/" className="mt-4 text-blue-500 underline">
//           Return to Home
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="px-4 md:px-10 mb-20 font-poppins min-h-screen bg-white">
//       <div className="max-w-[1720px] mx-auto">
//         {/* Breadcrumbs */}
//         <nav className="py-6 text-sm flex items-center gap-2 text-gray-500">
//           <Link href="/">Home</Link>
//           <FaChevronRight size={10} />
//           <span className="text-[#7CB640] font-medium">{campaign.name}</span>
//         </nav>

//         {/* Hero Banner */}
//         <div
//           className="relative overflow-hidden rounded-[24px] md:rounded-[40px] min-h-[300px] md:h-[450px] flex items-center mb-12 shadow-lg"
//           style={{
//             backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.2)), url("${getImageUrl(campaign.banner_url)}")`,
//             backgroundSize: "cover",
//             backgroundPosition: "center",
//           }}
//         >
//           <div className="relative z-10 px-8 md:px-16 text-white space-y-4">
//             <div className="flex gap-3">
//               <span className="bg-[#7CB640] px-4 py-1 rounded-full text-sm font-bold flex items-center gap-2">
//                 <FaTag /> {campaign.discount_value}% OFF
//               </span>
//               {campaign.is_free_delivery && (
//                 <span className="bg-green-500 px-4 py-1 rounded-full text-sm font-bold flex items-center gap-2">
//                   <FaShippingFast /> Free Delivery
//                 </span>
//               )}
//             </div>
//             <h1 className="text-4xl md:text-6xl font-black">{campaign.name}</h1>
//             <p className="max-w-xl text-gray-200">{campaign.description}</p>
//           </div>
//         </div>

//         {/* Product Grid */}
//         <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
//           Offer Products
//         </h2>

//         <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
//           {products.map((product) => {
//             const originalPrice = Number(product.sell_price);
//             const discount = Number(campaign.discount_value);
//             // অরিজিনাল প্রাইস ক্যালকুলেট করছি জাস্ট দেখানোর জন্য
//             const fakeOriginalPrice = Math.round(
//               originalPrice / (1 - discount / 100),
//             );

//             return (
//               <div
//                 key={product.id}
//                 className="bg-white border border-gray-100 rounded-[32px] p-4 flex flex-col shadow-sm hover:shadow-md transition-all"
//               >
//                 {/* Product Image */}
//                 <div className="relative h-48 md:h-64 w-full mb-4 rounded-2xl overflow-hidden bg-gray-50">
//                   <Image
//                     src={getImageUrl(product.images?.[0])}
//                     alt={product.name}
//                     fill
//                     className="object-contain p-2"
//                     unoptimized
//                   />
//                   <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
//                     -{discount}%
//                   </div>
//                 </div>

//                 <h3 className="font-bold text-gray-800 text-sm md:text-base mb-1 line-clamp-2 h-10 md:h-12">
//                   {product.name}
//                 </h3>

//                 <div className="flex items-center gap-2 mb-4">
//                   <span className="text-[#7CB640] text-lg font-bold">
//                     TK {originalPrice}
//                   </span>
//                   <span className="text-gray-400 line-through text-xs">
//                     TK {fakeOriginalPrice}
//                   </span>
//                 </div>

//                 <button
//                   onClick={() => orderMutation.mutate(product)}
//                   disabled={orderMutation.isPending}
//                   className="mt-auto w-full bg-[#7CB640] hover:bg-[#6a9d35] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
//                 >
//                   <FaShoppingBasket size={14} />
//                   {orderMutation.isPending ? "..." : "Order Now"}
//                 </button>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }
