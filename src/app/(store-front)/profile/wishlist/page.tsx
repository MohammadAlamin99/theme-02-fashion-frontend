"use client";
import { useQuery } from "@tanstack/react-query";
import WishlistItem from "./WishlistItem";
import { getWishlist } from "@/services-api/wishlistService";
import { Loader2 } from "lucide-react";
import { WishlistProduct } from "@/@types/wishlist.type";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";
const WishlistPage = () => {
  const { language } = useLanguage();
  const t = translations[language];

  const { data: wishlistItems = [], isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlist,
  });
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-[#FF7050]" size={40} />
      </div>
    );
  }
  return (
    <div className="bg-white rounded-[12px] border border-[#D2D2D2] p-6 font-poppins">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-[20px] font-semibold text-black">{t.wishlist}</h2>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {wishlistItems?.map((item: WishlistProduct) => (
          <WishlistItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
