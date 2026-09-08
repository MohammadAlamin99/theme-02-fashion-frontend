// "use client";

// import { Product } from "@/@types/product.type";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import toast from "react-hot-toast";

// // Services & Icons
// import { createCart } from "@/services-api/cartService";
// import { useAuthStore } from "@/store/useAuthStore";
// import Themecarticon from "../svg/Themecarticon";

// export const ProductCard = ({ product }: { product: Product }) => {
//   const router = useRouter();
//   const queryClient = useQueryClient();
//   const user = useAuthStore((state) => state.user);

//   // Pricing Logic
//   const regularPrice = parseFloat(product.regular_price) || 0;
//   const sellPrice = parseFloat(product.sell_price) || 0;

//   const hasCampaignDiscount = !!product.campaign_discount;
//   const campaignDiscountVal = hasCampaignDiscount
//     ? Number(product.campaign_discount?.discount_value) || 0
//     : 0;

//   const computedCampaignPrice =
//     hasCampaignDiscount && campaignDiscountVal > 0
//       ? Math.round(sellPrice * (1 - campaignDiscountVal / 100))
//       : sellPrice;

//   const displayPrice = hasCampaignDiscount
//     ? product.final_price !== undefined && product.final_price !== null
//       ? Number(product.final_price)
//       : computedCampaignPrice
//     : sellPrice;

//   const strikeThroughPrice = hasCampaignDiscount ? sellPrice : regularPrice;
//   const showStrikeThrough =
//     (hasCampaignDiscount && sellPrice > displayPrice) ||
//     regularPrice > sellPrice;
//   const inStock = product.quantity > 0;

//   const badgeText = hasCampaignDiscount
//     ? `${campaignDiscountVal}% OFF`
//     : regularPrice > sellPrice
//       ? `${Math.round(((regularPrice - sellPrice) / regularPrice) * 100)}% OFF`
//       : null;

//   // Image Handling (Backend URL & Nesting Fix)
//   const backendBaseUrl =
//     process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
//     "http://localhost:8082";
//   const rawImg = product.images?.[0];
//   const imagePath =
//     typeof rawImg === "string" ? rawImg : rawImg?.url?.url || rawImg?.url || "";
//   const usableImage = imagePath
//     ? imagePath.startsWith("http")
//       ? imagePath
//       : `${backendBaseUrl}/${imagePath.replace(/^\/+/, "")}`
//     : "/images/placeholder.png";

//   // Cart & Order Logic
//   const { mutate: handleAddToCart, isPending: isAddingToCart } = useMutation({
//     mutationFn: async () => {
//       let guestId = localStorage.getItem("guestId");
//       if (!user && (!guestId || guestId === "undefined")) {
//         guestId = "guest_" + Date.now();
//         localStorage.setItem("guestId", guestId);
//       }
//       const firstVariantId = product.variants?.[0]?.id?.toString() || null;
//       return createCart(
//         product.id.toString(),
//         1,
//         firstVariantId,
//         user ? null : guestId,
//       );
//     },
//     onSuccess: () => {
//       toast.success("Added to cart!");
//       queryClient.invalidateQueries({ queryKey: ["cart"] });
//     },
//     onError: (err: unknown) => {
//       if (err instanceof Error) {
//         toast.error(err.message);
//       } else {
//         toast.error("Failed to add to cart");
//       }
//     },
//   });

//   const handleOrderNow = async (e: React.MouseEvent) => {
//     e.preventDefault();
//     if (!inStock) return;
//     try {
//       // Direct Order Logic
//       let guestId = localStorage.getItem("guestId");
//       if (!user && (!guestId || guestId === "undefined")) {
//         guestId = "guest_" + Date.now();
//         localStorage.setItem("guestId", guestId);
//       }
//       const firstVariantId = product.variants?.[0]?.id?.toString() || null;
//       await createCart(
//         product.id.toString(),
//         1,
//         firstVariantId,
//         user ? null : guestId,
//       );

//       queryClient.invalidateQueries({ queryKey: ["cart"] });
//       router.push("/order");
//     } catch (err) {
//       if (err instanceof Error) {
//         toast.error(err.message);
//       } else {
//         toast.error("Order process failed");
//       }
//     }
//   };

//   return (
//     <div className="group font-inter relative overflow-hidden rounded-[20px] transition-all duration-500 hover:shadow-2xl w-full max-w-[364px] aspect-[181/271] min-h-[450px] md:min-h-[545px] mx-auto bg-[#f2f2f2]">
//       {/* Background Image */}
//       <Link href={`/product/${product.slug}`}>
//         <Image
//           src={usableImage}
//           alt={product.name}
//           fill
//           sizes="(max-width: 768px) 100vw, 364px"
//           className="object-cover transition-transform duration-700 group-hover:scale-110"
//           priority
//           unoptimized
//         />
//       </Link>

//       {/* Badges & Icons Container */}
//       <div className="absolute inset-x-4 top-4 md:inset-x-5 md:top-5 z-20 flex justify-between items-start">
//         {/* Sale Badge */}
//         {badgeText ? (
//           <div className="rounded-[100px] bg-[#FF4800B2] px-3 py-1 text-[10px] md:text-[12px] font-bold text-white border border-white/20 backdrop-blur-sm uppercase">
//             {badgeText}
//           </div>
//         ) : (
//           <div />
//         )}

//         {/* Cart Icon */}
//         <button
//           onClick={(e) => {
//             e.preventDefault();
//             handleAddToCart();
//           }}
//           disabled={!inStock || isAddingToCart}
//           className="cursor-pointer flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full border border-white/30 bg-[#EFEFEFA3] text-white backdrop-blur-md transition-all hover:bg-white hover:text-black active:scale-90 disabled:opacity-50"
//         >
//           <Themecarticon />
//         </button>
//       </div>

//       {/* Bottom Content Overlay */}
//       <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end p-4 md:p-6 pb-6 md:pb-8">
//         {/* Title */}
//         <Link href={`/product/${product.slug}`}>
//           <h3 className="mb-2 text-[20px] md:text-[24px] font-bold text-[#262626] tracking-tight hover:text-black transition-colors line-clamp-2">
//             {product.name}
//           </h3>
//         </Link>

//         <div className="flex flex-wrap items-center justify-between gap-3">
//           {/* Pricing Logic */}
//           <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
//             <div className="flex items-baseline gap-1.5">
//               <span className="text-base md:text-lg text-[#262626] font-bold tracking-tight">
//                 {displayPrice}
//               </span>
//               <span className="text-[10px] md:text-[12px] font-normal text-[#26262680]">
//                 BDT
//               </span>
//             </div>
//             {showStrikeThrough && (
//               <span className="text-[10px] md:text-[12px] font-normal text-[#26262680] line-through decoration-[#26262680]">
//                 {strikeThroughPrice}
//               </span>
//             )}
//           </div>

//           {/* Action Button */}
//           <button
//             onClick={handleOrderNow}
//             disabled={!inStock}
//             className="cursor-pointer border border-white/40 flex items-center justify-center rounded-[80px] bg-[#EFEFEF33] px-4 py-2 md:px-[20px] md:py-[10px] text-[12px] md:text-[14px] font-semibold text-[#262626] backdrop-blur-xl transition-all hover:bg-[#262626] hover:text-white active:scale-95 uppercase tracking-wider disabled:bg-gray-200 disabled:text-gray-400"
//           >
//             {inStock ? "Order Now" : "Out of Stock"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

"use client";

import { Product } from "@/@types/product.type";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// Services & Icons
import { createCart } from "@/services-api/cartService";
import { useAuthStore } from "@/store/useAuthStore";
import Themecarticon from "../svg/Themecarticon";

export const ProductCard = ({ product }: { product: Product }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  // Pricing Logic
  const regularPrice = parseFloat(product.regular_price) || 0;
  const sellPrice = parseFloat(product.sell_price) || 0;

  const hasCampaignDiscount = !!product.campaign_discount;
  const campaignDiscountVal = hasCampaignDiscount
    ? Number(product.campaign_discount?.discount_value) || 0
    : 0;

  const computedCampaignPrice =
    hasCampaignDiscount && campaignDiscountVal > 0
      ? Math.round(sellPrice * (1 - campaignDiscountVal / 100))
      : sellPrice;

  const displayPrice = hasCampaignDiscount
    ? product.final_price !== undefined && product.final_price !== null
      ? Number(product.final_price)
      : computedCampaignPrice
    : sellPrice;

  const strikeThroughPrice = hasCampaignDiscount ? sellPrice : regularPrice;
  const showStrikeThrough =
    (hasCampaignDiscount && sellPrice > displayPrice) ||
    regularPrice > sellPrice;
  const inStock = product.quantity > 0;

  const badgeText = hasCampaignDiscount
    ? `${campaignDiscountVal}% OFF`
    : regularPrice > sellPrice
      ? `${Math.round(((regularPrice - sellPrice) / regularPrice) * 100)}% OFF`
      : null;

  // ===== Image Handling (Backend URL & Nesting Fix) =====
  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  function extractImageUrl(val: unknown): string {
    if (typeof val === "string") return val;
    if (val && typeof val === "object") {
      const inner = (val as Record<string, unknown>).url;
      if (typeof inner === "string") return inner;
      // handles double-nested case: { url: { url: "...", alt_text: "" } }
      if (inner && typeof inner === "object") {
        const deepUrl = (inner as Record<string, unknown>).url;
        if (typeof deepUrl === "string") return deepUrl;
      }
    }
    return "";
  }

  function extractAltText(val: unknown, fallback: string): string {
    if (val && typeof val === "object") {
      const obj = val as Record<string, unknown>;
      if (typeof obj.alt_text === "string" && obj.alt_text) return obj.alt_text;
      const inner = obj.url;
      if (inner && typeof inner === "object") {
        const innerAlt = (inner as Record<string, unknown>).alt_text;
        if (typeof innerAlt === "string" && innerAlt) return innerAlt;
      }
    }
    return fallback;
  }

  const rawImg = product.images?.[0];
  const imagePath = extractImageUrl(rawImg);
  const cleanImg = imagePath.trim();

  const usableImage = cleanImg
    ? cleanImg.startsWith("http")
      ? cleanImg
      : `${backendBaseUrl}/${cleanImg.replace(/^\/+/, "")}`
    : "/images/placeholder.png";

  const imageAlt = extractAltText(rawImg, product.name);

  // Cart & Order Logic
  const { mutate: handleAddToCart, isPending: isAddingToCart } = useMutation({
    mutationFn: async () => {
      let guestId = localStorage.getItem("guestId");
      if (!user && (!guestId || guestId === "undefined")) {
        guestId = "guest_" + Date.now();
        localStorage.setItem("guestId", guestId);
      }
      const firstVariantId = product.variants?.[0]?.id?.toString() || null;
      return createCart(
        product.id.toString(),
        1,
        firstVariantId,
        user ? null : guestId,
      );
    },
    onSuccess: () => {
      toast.success("Added to cart!");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (err: unknown) => {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to add to cart");
      }
    },
  });

  const handleOrderNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!inStock) return;
    try {
      // Direct Order Logic
      let guestId = localStorage.getItem("guestId");
      if (!user && (!guestId || guestId === "undefined")) {
        guestId = "guest_" + Date.now();
        localStorage.setItem("guestId", guestId);
      }
      const firstVariantId = product.variants?.[0]?.id?.toString() || null;
      await createCart(
        product.id.toString(),
        1,
        firstVariantId,
        user ? null : guestId,
      );

      queryClient.invalidateQueries({ queryKey: ["cart"] });
      router.push("/order");
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Order process failed");
      }
    }
  };

  return (
    <div className="group font-inter relative overflow-hidden rounded-[20px] transition-all duration-500 hover:shadow-2xl w-full max-w-[364px] aspect-[181/271] min-h-[450px] md:min-h-[545px] mx-auto bg-[#f2f2f2]">
      {/* Background Image */}
      <Link href={`/product/${product.slug}`}>
        <Image
          src={usableImage}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 364px"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          priority
          unoptimized
        />
      </Link>

      {/* Badges & Icons Container */}
      <div className="absolute inset-x-4 top-4 md:inset-x-5 md:top-5 z-20 flex justify-between items-start">
        {/* Sale Badge */}
        {badgeText ? (
          <div className="rounded-[100px] bg-[#FF4800B2] px-3 py-1 text-[10px] md:text-[12px] font-bold text-white border border-white/20 backdrop-blur-sm uppercase">
            {badgeText}
          </div>
        ) : (
          <div />
        )}

        {/* Cart Icon */}
        <button
          onClick={(e) => {
            e.preventDefault();
            handleAddToCart();
          }}
          disabled={!inStock || isAddingToCart}
          className="cursor-pointer flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full border border-white/30 bg-[#EFEFEFA3] text-white backdrop-blur-md transition-all hover:bg-white hover:text-black active:scale-90 disabled:opacity-50"
        >
          <Themecarticon />
        </button>
      </div>

      {/* Bottom Content Overlay */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end p-4 md:p-6 pb-6 md:pb-8">
        {/* Title */}
        <Link href={`/product/${product.slug}`}>
          <h3 className="mb-2 text-[20px] md:text-[24px] font-bold text-[#262626] tracking-tight hover:text-black transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Pricing Logic */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base md:text-lg text-[#262626] font-bold tracking-tight">
                {displayPrice}
              </span>
              <span className="text-[10px] md:text-[12px] font-normal text-[#26262680]">
                BDT
              </span>
            </div>
            {showStrikeThrough && (
              <span className="text-[10px] md:text-[12px] font-normal text-[#26262680] line-through decoration-[#26262680]">
                {strikeThroughPrice}
              </span>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={handleOrderNow}
            disabled={!inStock}
            className="cursor-pointer border border-white/40 flex items-center justify-center rounded-[80px] bg-[#EFEFEF33] px-4 py-2 md:px-[20px] md:py-[10px] text-[12px] md:text-[14px] font-semibold text-[#262626] backdrop-blur-xl transition-all hover:bg-[#262626] hover:text-white active:scale-95 uppercase tracking-wider disabled:bg-gray-200 disabled:text-gray-400"
          >
            {inStock ? "Order Now" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
};
