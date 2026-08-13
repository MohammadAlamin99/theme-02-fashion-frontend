"use client";

import Image from "next/image";
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { Product } from "@/@types/product.type";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";

const backendBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
  "http://localhost:8082";

interface ProductMiniCardProps {
  product: Product;
}

const ProductMiniCard = ({ product }: ProductMiniCardProps) => {
  const { language } = useLanguage();
  const t = translations[language];
  const rowImage = product?.images[0] || "";
  const imageUrl = rowImage.startsWith("http")
    ? rowImage
    : `${backendBaseUrl}/${rowImage.replace(/^\/+/, "")}`;

  return (
    <Link href={`/product/${product.slug}`}>
      {/* Product Image */}

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-base font-semibold text-black leading-snug line-clamp-2 mb-1 max-w-[155px]">
          {product.name}
        </h4>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold text-[#FF7050]">
            {t.product.bdt} {product.sell_price}
          </span>
          {Number(product.regular_price) > Number(product.sell_price) && (
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
                  i < Math.floor(Number(product.avg_rating) || 0)
                    ? "text-[#FFB800]"
                    : "text-gray-300"
                }
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">
            ({product.total_reviews || 0})
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductMiniCard;

