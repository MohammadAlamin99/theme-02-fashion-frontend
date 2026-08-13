"use client";

import { translations } from "@/locales";
import { useLanguage } from "@/providers/LanguageProvider";
import Image from "next/image";
import Link from "next/link";
import { FaStar } from "react-icons/fa";

export interface ProductData {
  id: string;
  name: string;
  regular_price: string;
  sell_price: string;
  avg_rating: number;
  total_reviews: number;
  images: string[];
  slug: string;
}

const RelatedProductCard = ({ product }: { product: ProductData }) => {
  const { language } = useLanguage();
  const t = translations[language];
  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  const rawFirstImg = product.images?.[0];
  const isValidImg =
    typeof rawFirstImg === "string" && rawFirstImg.trim().length > 1;
  const productImage = isValidImg
    ? rawFirstImg.startsWith("http") || rawFirstImg.startsWith("/images/")
      ? rawFirstImg
      : `${backendBaseUrl}/${rawFirstImg.replace(/^\/+/, "")}`
    : "/images/placeholder.svg";

  return (
    <Link href={`/product/${product.slug}`}>
      <div className="flex items-center gap-3 p-3 rounded-xl cursor-pointer group bg-[#F2F2F2] mb-4 last:mb-0">
        {/* Product Image */}
        <div className="w-[94px] h-[116px] rounded-xl overflow-hidden bg-gray-200 shrink-0">
          <Image
            src={productImage}
            alt={product.name}
            width={94}
            height={116}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-black leading-snug line-clamp-2 mb-1 max-w-[155px]">
            {product.name}
          </h4>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-[#FF7050]">
              {t.product.bdt} {product.sell_price}
            </span>

            {product.regular_price !== product.sell_price && (
              <span className="text-xs text-gray-400 line-through">
                {t.product.bdt} {product.regular_price}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <div className="flex text-[#FFB800] text-xs gap-[1px]">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={
                    i < Math.round(product.avg_rating)
                      ? "text-[#FFB800]"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({product.total_reviews})
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RelatedProductCard;
