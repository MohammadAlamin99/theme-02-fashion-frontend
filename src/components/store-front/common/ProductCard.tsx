// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { FaHeart, FaStar } from "react-icons/fa";
// import WishIcon from "../svg/WishIcon";

// import { Product } from "@/@types/product.type";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import {
//   createWishlist,
//   deleteWishlist,
//   getWishlist,
// } from "@/services-api/wishlistService";
// import toast from "react-hot-toast";
// import { createCart } from "@/services-api/cartService";
// import { useAuthStore } from "@/store/useAuthStore";
// import { useLanguage } from "@/providers/LanguageProvider";
// import { translations } from "@/locales";

// interface ProductCardProps {
//   product: Product;
//   isShowWishlist?: boolean;
// }

// const ProductCard = ({ product, isShowWishlist = true }: ProductCardProps) => {
//   const router = useRouter();
//   const queryClient = useQueryClient();
//   const user = useAuthStore((state) => state.user);
//   const { language } = useLanguage();
//   const t = translations[language];

//   const { data: wishlistItems = [] } = useQuery({
//     queryKey: ["wishlist"],
//     queryFn: getWishlist,
//   });

//   const isWishlisted =
//     Array.isArray(wishlistItems) &&
//     wishlistItems.some((item) => item.productId === product.id);

//   const { mutate: addToWishlist, isPending: isAdding } = useMutation({
//     mutationFn: () => createWishlist(product.id.toString()),
//     onSuccess: () => {
//       toast.success("Added to wishlist!");
//       queryClient.invalidateQueries({ queryKey: ["wishlist"] });
//     },
//     onError: (error) => toast.error(error.message),
//   });

//   const { mutate: removeFromWishlist, isPending: isRemoving } = useMutation({
//     mutationFn: () => deleteWishlist(product.id.toString()),
//     onSuccess: () => {
//       toast.success("Removed from wishlist!");
//       queryClient.invalidateQueries({ queryKey: ["wishlist"] });
//     },
//     onError: (error) => toast.error(error.message),
//   });

//   const handleWishlistToggle = (e: React.MouseEvent) => {
//     e.preventDefault();
//     if (isAdding || isRemoving) return;

//     if (!user) {
//       toast.error("Please login to add items to wishlist!");
//       return;
//     }

//     if (isWishlisted) {
//       removeFromWishlist();
//     } else {
//       addToWishlist();
//     }
//   };

//   const {
//     mutateAsync: handleAddToCartAsync,
//     mutate: handleAddToCart,
//     isPending: isAddingToCart,
//   } = useMutation({
//     mutationFn: async () => {
//       let guestId = localStorage.getItem("guestId");
//       if (!user) {
//         if (!guestId || guestId === "undefined" || guestId === "null") {
//           guestId =
//             "guest_" +
//             Date.now() +
//             "_" +
//             Math.random().toString(36).substring(2, 9);
//           localStorage.setItem("guestId", guestId);
//         }
//       }
//       const firstVariantId =
//         product.variants && product.variants.length > 0
//           ? product.variants[0].id.toString()
//           : null;
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
//     onError: (error: unknown) => {
//       if (error instanceof Error) {
//         toast.error(error.message || "Failed to add to cart");
//       } else {
//         toast.error("Failed to add to cart");
//       }
//     },
//   });

//   const handleOrderNow = async (e: React.MouseEvent) => {
//     e.preventDefault();
//     if (!inStock) return;

//     try {
//       await handleAddToCartAsync();
//       router.push("/order");
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   // ===== Pricing Logic =====
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

//   const hasRegularDiscount = regularPrice > sellPrice;

//   const badgeText =
//     hasCampaignDiscount && campaignDiscountVal > 0
//       ? `${campaignDiscountVal}% OFF`
//       : product.discount_tag
//         ? product.discount_tag
//         : hasRegularDiscount
//           ? `${Math.round(((regularPrice - sellPrice) / regularPrice) * 100)}% OFF`
//           : null;

//   const showBadge = !!badgeText;
//   const strikeThroughPrice = hasCampaignDiscount ? sellPrice : regularPrice;
//   const showStrikeThrough =
//     (hasCampaignDiscount && sellPrice > displayPrice) ||
//     (hasRegularDiscount && regularPrice > sellPrice);

//   const inStock = product.quantity > 0;
//   const ratingValue = Number(product.avg_rating) || 0;

//   const backendBaseUrl =
//     process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
//     "http://localhost:8083";

//   const rawFirst = product.images?.[0];
//   const imagePath =
//     typeof rawFirst === "string" ? rawFirst : rawFirst?.url || "";
//   const cleanImg = imagePath.trim();
//   const productImage = cleanImg || "/images/placeholder.svg";

//   const usableImage =
//     productImage.startsWith("http") || productImage.startsWith("/images/")
//       ? productImage
//       : `${backendBaseUrl}/${productImage.replace(/^\/+/, "")}`;

//   const imageAlt =
//     typeof rawFirst === "object" && rawFirst?.alt_text
//       ? rawFirst.alt_text
//       : product.name;
//   return (
//     <div className="group flex flex-col p-2.5 md:p-3 bg-[#F2F2F2] border-[1.5px] border-[#E3E3E3] rounded-2xl w-full md:max-w-[350px] font-poppins h-full justify-between">
//       <div>
//         <div className="relative rounded-[12px] aspect-square mb-2 md:mb-3 overflow-hidden">
//           {/* Discount Badge — campaign discount কে priority দেওয়া হচ্ছে */}
//           {showBadge && (
//             <div
//               className={`absolute top-2 left-2 text-white text-[10px] md:text-[12px] font-medium px-[6px] py-[2px] rounded-[8px] z-10 ${
//                 hasCampaignDiscount ? "bg-[#E4572E]" : "bg-[#7CB640]"
//               }`}
//             >
//               {badgeText}
//             </div>
//           )}

//           {/* 🆕 Campaign name tag (optional, চাইলে বাদ দিতে পারেন) */}
//           {hasCampaignDiscount && (
//             <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] md:text-[10px] px-[6px] py-[2px] rounded-[6px] z-10">
//               {product.campaign_discount!.campaign_name}
//             </div>
//           )}

//           {isShowWishlist && (
//             <button
//               onClick={handleWishlistToggle}
//               disabled={isAdding || isRemoving}
//               className="cursor-pointer absolute top-2 right-2 z-20 hover:scale-110 transition-transform bg-white/90 p-1.5 rounded-full shadow-md"
//             >
//               {isWishlisted ? (
//                 <FaHeart className="w-5 h-5 md:w-6 md:h-6 text-[#7CB640]" />
//               ) : (
//                 <WishIcon className="w-6 md:w-7 text-gray-500" />
//               )}
//             </button>
//           )}
//           <Link
//             href={`/product/${product.slug}`}
//             className="relative block w-full h-full"
//           >
//             <Image
//               src={usableImage}
//               alt={imageAlt}
//               fill
//               sizes="(max-width: 768px) 100vw, 350px"
//               className="object-contain group-hover:scale-105 transition-transform duration-300"
//               unoptimized
//             />
//           </Link>
//         </div>

//         <div className="flex flex-col gap-1 md:gap-2">
//           <Link href={`/product/${product.slug}`}>
//             <h3 className="text-black font-poppins md:text-[18px] text-[14px] font-medium leading-tight line-clamp-2 min-h-[36px] hover:text-[#7CB640] transition-colors">
//               {product.name}
//             </h3>
//           </Link>

//           <div className="flex items-center gap-1 flex-wrap">
//             <div className="flex text-[#EABC01] gap-0.5">
//               {[...Array(5)].map((_, i) => (
//                 <span key={i} className="text-[11px] md:text-[14px]">
//                   <FaStar
//                     className={
//                       i < Math.floor(ratingValue)
//                         ? "text-[#EABC01]"
//                         : "text-gray-300"
//                     }
//                   />
//                 </span>
//               ))}
//             </div>
//             <span className="text-[#727272] text-[10px] md:text-[12px] font-medium font-poppins">
//               ({ratingValue.toFixed(1)})
//             </span>
//             <span className="text-[#7CB640] text-[10px] md:text-[12px] font-medium font-poppins md:ml-auto ml-0">
//               ({product.total_reviews}{" "}
//               {product.total_reviews > 1 ? "Reviews" : "Review"})
//             </span>
//           </div>

//           {/* Pricing & Stock Section — Updated */}
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between md:mt-1 mt-0 gap-1">
//             <div className="flex items-baseline gap-1.5 flex-wrap">
//               <span className="text-[#7CB640] font-poppins text-[16px] md:text-[20px] font-semibold">
//                 TK {displayPrice}
//               </span>
//               {showStrikeThrough && (
//                 <span className="text-[#727272] font-poppins text-[12px] md:text-[16px] font-medium line-through">
//                   TK {strikeThroughPrice}
//                 </span>
//               )}
//             </div>

//             {inStock ? (
//               <div className="bg-[#113161] text-white text-[10px] md:text-[12px] font-medium px-[6px] py-[2px] rounded-[8px] w-fit">
//                 In Stock
//               </div>
//             ) : (
//               <div className="bg-red-500 text-white text-[10px] md:text-[12px] font-medium px-[6px] py-[2px] rounded-[8px] w-fit">
//                 Out of Stock
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="flex gap-1.5 mt-3 w-full lg:flex-row sm:flex-col flex-col">
//         <button
//           className="w-full cursor-pointer bg-[#7CB640] text-white font-poppins md:text-[16px] text-xs font-medium py-1.5 md:py-2 rounded-[8px] transition-all border border-[#E2E2E2] disabled:opacity-50"
//           onClick={handleOrderNow}
//           disabled={!inStock || isAddingToCart}
//         >
//           {inStock ? t.product.orderNow : t.product.outofstock}
//         </button>

//         {inStock && (
//           <button
//             onClick={(e) => {
//               e.preventDefault();
//               handleAddToCart();
//             }}
//             disabled={isAddingToCart}
//             className="w-full bg-white border border-[#E2E2E2] md:py-2 py-1.5 rounded-lg cursor-pointer md:text-[16px] text-xs"
//           >
//             {isAddingToCart ? t.product.addToCart + "..." : t.product.addToCart}
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProductCard;

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaHeart, FaStar } from "react-icons/fa";
import WishIcon from "../svg/WishIcon";

import { Product } from "@/@types/product.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createWishlist,
  deleteWishlist,
  getWishlist,
} from "@/services-api/wishlistService";
import toast from "react-hot-toast";
import { createCart } from "@/services-api/cartService";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";

interface ProductCardProps {
  product: Product;
  isShowWishlist?: boolean;
}

const ProductCard = ({ product, isShowWishlist = true }: ProductCardProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const { language } = useLanguage();
  const t = translations[language];

  const { data: wishlistItems = [] } = useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlist,
  });

  const isWishlisted =
    Array.isArray(wishlistItems) &&
    wishlistItems.some((item) => item.productId === product.id);

  const { mutate: addToWishlist, isPending: isAdding } = useMutation({
    mutationFn: () => createWishlist(product.id.toString()),
    onSuccess: () => {
      toast.success("Added to wishlist!");
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const { mutate: removeFromWishlist, isPending: isRemoving } = useMutation({
    mutationFn: () => deleteWishlist(product.id.toString()),
    onSuccess: () => {
      toast.success("Removed from wishlist!");
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAdding || isRemoving) return;

    if (!user) {
      toast.error("Please login to add items to wishlist!");
      return;
    }

    if (isWishlisted) {
      removeFromWishlist();
    } else {
      addToWishlist();
    }
  };

  const {
    mutateAsync: handleAddToCartAsync,
    mutate: handleAddToCart,
    isPending: isAddingToCart,
  } = useMutation({
    mutationFn: async () => {
      let guestId = localStorage.getItem("guestId");
      if (!user) {
        if (!guestId || guestId === "undefined" || guestId === "null") {
          guestId =
            "guest_" +
            Date.now() +
            "_" +
            Math.random().toString(36).substring(2, 9);
          localStorage.setItem("guestId", guestId);
        }
      }
      const firstVariantId =
        product.variants && product.variants.length > 0
          ? product.variants[0].id.toString()
          : null;
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
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to add to cart");
      } else {
        toast.error("Failed to add to cart");
      }
    },
  });

  const handleOrderNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!inStock) return;

    try {
      await handleAddToCartAsync();
      router.push("/order");
    } catch (err) {
      console.log(err);
    }
  };

  // ===== Pricing Logic (অপরিবর্তিত) =====
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

  const hasRegularDiscount = regularPrice > sellPrice;

  const badgeText =
    hasCampaignDiscount && campaignDiscountVal > 0
      ? `${campaignDiscountVal}% OFF`
      : product.discount_tag
        ? product.discount_tag
        : hasRegularDiscount
          ? `${Math.round(((regularPrice - sellPrice) / regularPrice) * 100)}% OFF`
          : null;

  const showBadge = !!badgeText;
  const strikeThroughPrice = hasCampaignDiscount ? sellPrice : regularPrice;
  const showStrikeThrough =
    (hasCampaignDiscount && sellPrice > displayPrice) ||
    (hasRegularDiscount && regularPrice > sellPrice);

  const inStock = product.quantity > 0;
  const ratingValue = Number(product.avg_rating) || 0;

  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8083";

  // ===== Image Extraction (FIXED — handles string, single-nested, and double-nested url) =====
  const rawFirst = product.images?.[0];

  function extractImageUrl(val: unknown): string {
    if (typeof val === "string") return val;
    if (val && typeof val === "object") {
      const inner = (val as Record<string, unknown>).url;
      if (typeof inner === "string") return inner;
      // handles double-nested case: { url: { url: "...", title: "", ... } }
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

  const imagePath = extractImageUrl(rawFirst);
  const cleanImg = imagePath.trim();
  const productImage = cleanImg || "/images/placeholder.svg";

  const usableImage =
    productImage.startsWith("http") || productImage.startsWith("/images/")
      ? productImage
      : `${backendBaseUrl}/${productImage.replace(/^\/+/, "")}`;

  const imageAlt = extractAltText(rawFirst, product.name);

  return (
    <div className="group flex flex-col p-2.5 md:p-3 bg-[#F2F2F2] border-[1.5px] border-[#E3E3E3] rounded-2xl w-full md:max-w-[350px] font-poppins h-full justify-between">
      <div>
        <div className="relative rounded-[12px] aspect-square mb-2 md:mb-3 overflow-hidden">
          {/* Discount Badge — campaign discount কে priority দেওয়া হচ্ছে */}
          {showBadge && (
            <div
              className={`absolute top-2 left-2 text-white text-[10px] md:text-[12px] font-medium px-[6px] py-[2px] rounded-[8px] z-10 ${
                hasCampaignDiscount ? "bg-[#E4572E]" : "bg-[#7CB640]"
              }`}
            >
              {badgeText}
            </div>
          )}

          {/* 🆕 Campaign name tag (optional, চাইলে বাদ দিতে পারেন) */}
          {hasCampaignDiscount && (
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] md:text-[10px] px-[6px] py-[2px] rounded-[6px] z-10">
              {product.campaign_discount?.campaign_name}
            </div>
          )}

          {isShowWishlist && (
            <button
              onClick={handleWishlistToggle}
              disabled={isAdding || isRemoving}
              className="cursor-pointer absolute top-2 right-2 z-20 hover:scale-110 transition-transform bg-white/90 p-1.5 rounded-full shadow-md"
            >
              {isWishlisted ? (
                <FaHeart className="w-5 h-5 md:w-6 md:h-6 text-[#7CB640]" />
              ) : (
                <WishIcon className="w-6 md:w-7 text-gray-500" />
              )}
            </button>
          )}
          <Link
            href={`/product/${product.slug}`}
            className="relative block w-full h-full"
          >
            <Image
              src={usableImage}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 350px"
              className="object-contain group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          </Link>
        </div>

        <div className="flex flex-col gap-1 md:gap-2">
          <Link href={`/product/${product.slug}`}>
            <h3 className="text-black font-poppins md:text-[18px] text-[14px] font-medium leading-tight line-clamp-2 min-h-[36px] hover:text-[#7CB640] transition-colors">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center gap-1 flex-wrap">
            <div className="flex text-[#EABC01] gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-[11px] md:text-[14px]">
                  <FaStar
                    className={
                      i < Math.floor(ratingValue)
                        ? "text-[#EABC01]"
                        : "text-gray-300"
                    }
                  />
                </span>
              ))}
            </div>
            <span className="text-[#727272] text-[10px] md:text-[12px] font-medium font-poppins">
              ({ratingValue.toFixed(1)})
            </span>
            <span className="text-[#7CB640] text-[10px] md:text-[12px] font-medium font-poppins md:ml-auto ml-0">
              ({product.total_reviews}{" "}
              {product.total_reviews > 1 ? "Reviews" : "Review"})
            </span>
          </div>

          {/* Pricing & Stock Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between md:mt-1 mt-0 gap-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-[#7CB640] font-poppins text-[16px] md:text-[20px] font-semibold">
                TK {displayPrice}
              </span>
              {showStrikeThrough && (
                <span className="text-[#727272] font-poppins text-[12px] md:text-[16px] font-medium line-through">
                  TK {strikeThroughPrice}
                </span>
              )}
            </div>

            {inStock ? (
              <div className="bg-[#113161] text-white text-[10px] md:text-[12px] font-medium px-[6px] py-[2px] rounded-[8px] w-fit">
                In Stock
              </div>
            ) : (
              <div className="bg-red-500 text-white text-[10px] md:text-[12px] font-medium px-[6px] py-[2px] rounded-[8px] w-fit">
                Out of Stock
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-1.5 mt-3 w-full lg:flex-row sm:flex-col flex-col">
        <button
          className="w-full cursor-pointer bg-[#7CB640] text-white font-poppins md:text-[16px] text-xs font-medium py-1.5 md:py-2 rounded-[8px] transition-all border border-[#E2E2E2] disabled:opacity-50"
          onClick={handleOrderNow}
          disabled={!inStock || isAddingToCart}
        >
          {inStock ? t.product.orderNow : t.product.outofstock}
        </button>

        {inStock && (
          <button
            onClick={(e) => {
              e.preventDefault();
              handleAddToCart();
            }}
            disabled={isAddingToCart}
            className="w-full bg-white border border-[#E2E2E2] md:py-2 py-1.5 rounded-lg cursor-pointer md:text-[16px] text-xs"
          >
            {isAddingToCart ? t.product.addToCart + "..." : t.product.addToCart}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
