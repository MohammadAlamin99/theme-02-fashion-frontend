import Image from "next/image";
import { FaRegTrashAlt } from "react-icons/fa";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteWishlist } from "@/services-api/wishlistService";
import toast from "react-hot-toast";
import { WishlistProduct } from "@/@types/wishlist.type";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";

export default function WishlistItem({ item }: { item: WishlistProduct }) {
  const queryClient = useQueryClient();
  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  const rowImage = item?.product?.images?.[0] || "";
  const useableImage = rowImage.startsWith("http")
    ? rowImage
    : `${backendBaseUrl}/${rowImage.replace(/^\/+/, "")}`;

  // revimove from wishlist
  const { mutate: handleRemoveFromWishlist, isPending: isRemoving } =
    useMutation({
      mutationFn: () => deleteWishlist(item?.product?.id.toString()),
      onSuccess: () => {
        toast.success("Removed from wishlist!");
        queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      },
      onError: (error) => toast.error(error.message),
    });

  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="bg-[#F9F9F9] rounded-[16px] p-4 flex flex-col gap-4 group border border-transparent hover:border-[#FF7050]/20 hover:shadow-lg hover:shadow-gray-100 transition-all duration-300">
      {/* Product Image Container */}
      <Link href={`/product/${item?.product?.slug}`}>
        <div className="rounded-[12px] aspect-square flex items-center justify-center relative overflow-hidden">
          <div className="w-full h-full relative group-hover:scale-110 transition-transform duration-500">
            <Image
              src={useableImage}
              alt={item?.product?.name || "product name"}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[14px] font-semibold text-black leading-snug line-clamp-2 h-[40px]">
          {item?.product?.name}
        </h3>

        {/* Quantity & Price Row */}
        <div className="flex items-center justify-between">
          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-[15px] font-bold text-[#FF7050]">
              {item?.product?.sell_price} BDT
            </span>
            <span className="text-[12px] text-[#A0A0A0] line-through font-medium">
              {item?.product?.regular_price} BDT
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 mt-1">
          <Link href={`/product/${item?.product?.slug}`} className="flex-1">
            <button className="w-full bg-[#FF7050] hover:bg-[#ff5d39] text-white py-3 rounded-[10px] text-sm font-bold transition-all cursor-pointer active:scale-95 shadow-sm shadow-orange-50">
              {t.placeOrder}
            </button>
          </Link>
          <button
            className="w-11 h-11 border border-[#FF4D4D] rounded-[10px] flex items-center justify-center text-[#FF4D4D] hover:bg-[#FF4D4D] hover:text-white transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            onClick={() => handleRemoveFromWishlist()}
            disabled={isRemoving}
          >
            <FaRegTrashAlt
              size={18}
              className={isRemoving ? "animate-pulse" : ""}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
