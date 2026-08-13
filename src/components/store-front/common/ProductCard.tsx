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

interface ProductCardProps {
  product: Product;
  isShowWishlist?: boolean;
}

const ProductCard = ({ product, isShowWishlist = true }: ProductCardProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  // get wislist
  const { data: wishlistItems = [] } = useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlist,
  });

  // check wishli if have ?
  const isWishlisted =
    Array.isArray(wishlistItems) &&
    wishlistItems.some((item) => item.productId === product.id);

  // wishlist mutation
  const { mutate: addToWishlist, isPending: isAdding } = useMutation({
    mutationFn: () => createWishlist(product.id.toString()),
    onSuccess: () => {
      toast.success("Added to wishlist!");
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
    onError: (error) => toast.error(error.message),
  });

  // revimove from wishlist
  const { mutate: removeFromWishlist, isPending: isRemoving } = useMutation({
    mutationFn: () => deleteWishlist(product.id.toString()),
    onSuccess: () => {
      toast.success("Removed from wishlist!");
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
    onError: (error) => toast.error(error.message),
  });

  // handle wishlist toggle
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
  // order handler
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

  // Logic for dynamic values
  const regularPrice = parseFloat(product.regular_price) || 0;
  const sellPrice = parseFloat(product.sell_price) || 0;

  // disoucnt logic
  const hasDiscount = regularPrice > sellPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((regularPrice - sellPrice) / regularPrice) * 100)
    : 0;

  const inStock = product.quantity > 0;
  const ratingValue = Number(product.avg_rating) || 0;

  // Use first image from array or a placeholder
  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";
  const firstImage =
    product.images && product.images.length > 0 ? product.images[0] : null;
  const cleanImg = typeof firstImage === "string" ? firstImage.trim() : "";
  const isValidImg = cleanImg.replace(/^\/+/, "").length > 0;

  const productImage = isValidImg ? cleanImg : "/images/placeholder.svg";

  const usableImage =
    productImage.startsWith("http") || productImage.startsWith("/images/")
      ? productImage
      : `${backendBaseUrl}/${productImage.replace(/^\/+/, "")}`;

  return (
    <div className="group flex flex-col p-2.5 md:p-3 bg-[#F2F2F2] border-[1.5px] border-[#E3E3E3] rounded-2xl w-full md:max-w-[350px] font-poppins h-full justify-between">
      <div>
        {/* Product Image Section */}
        <div className="relative rounded-[12px] aspect-square mb-2 md:mb-3 overflow-hidden">
          {/* Dynamic Discount Badge */}
          {(product.discount_tag || hasDiscount) && (
            <div className="absolute top-2 left-2 bg-[#FF7050] text-white text-[10px] md:text-[12px] font-medium px-[6px] py-[2px] rounded-[8px] z-10">
              {product.discount_tag
                ? product.discount_tag
                : `${discountPercentage}% OFF`}
            </div>
          )}

          {/* Wishlist Button */}
          {isShowWishlist && (
            <button
              onClick={handleWishlistToggle}
              disabled={isAdding || isRemoving}
              className="cursor-pointer absolute top-2 right-2 z-20 hover:scale-110 transition-transform bg-white/90 p-1.5 rounded-full shadow-md"
            >
              {isWishlisted ? (
                <FaHeart className="w-5 h-5 md:w-6 md:h-6 text-[#FF7050]" />
              ) : (
                <WishIcon className="w-6 md:w-7 text-gray-500" />
              )}
            </button>
          )}
          {/* Clickable Image Area */}
          <Link
            href={`/product/${product.slug}`}
            className="relative block w-full h-full"
          >
            <Image
              src={usableImage}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 350px"
              className="object-contain group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          </Link>
        </div>

        {/* Details Section */}
        <div className="flex flex-col gap-1 md:gap-2">
          {/* Dynamic Title */}
          <Link href={`/product/${product.slug}`}>
            <h3 className="text-black font-poppins md:text-[18px] text-[14px] font-medium leading-tight line-clamp-2 min-h-[36px] hover:text-[#FF7050] transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Dynamic Rating Section */}
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
            <span className="text-[#FF7050] text-[10px] md:text-[12px] font-medium font-poppins md:ml-auto ml-0">
              ({product.total_reviews}{" "}
              {product.total_reviews > 1 ? "Reviews" : "Review"})
            </span>
          </div>

          {/* Pricing & Stock Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between md:mt-1 mt-0 gap-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-[#FF7050] font-poppins text-[16px] md:text-[20px] font-semibold">
                TK {product.sell_price}
              </span>
              {hasDiscount && (
                <span className="text-[#727272] font-poppins text-[12px] md:text-[16px] font-medium line-through">
                  TK {product.regular_price}
                </span>
              )}
            </div>

            {/* Dynamic Stock Status */}
            {inStock ? (
              <div className="bg-[#32CD32] text-white text-[10px] md:text-[12px] font-medium px-[6px] py-[2px] rounded-[8px] w-fit">
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

      {/* Action Buttons */}
      <div className="flex gap-1.5 mt-3 w-full md:flex-row flex-col">
        <button
          className="w-full cursor-pointer bg-[#FF7050] text-white font-poppins md:text-[16px] text-xs font-medium py-1.5 md:py-2 rounded-[8px] transition-all border border-[#E2E2E2] disabled:opacity-50"
          onClick={handleOrderNow}
          disabled={!inStock || isAddingToCart}
        >
          {inStock ? "Order Now" : "Out of Stock"}
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            handleAddToCart();
          }}
          disabled={isAddingToCart}
          className="w-full bg-white border border-[#E2E2E2] md:py-2 py-1.5 rounded-lg cursor-pointer md:text-[16px] text-xs "
        >
          {isAddingToCart ? "Adding..." : "Add To Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
