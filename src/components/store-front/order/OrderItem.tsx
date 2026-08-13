"use client";
import React from "react";
import Image from "next/image";
import { RiDeleteBin6Line } from "react-icons/ri";
import { CartItem } from "@/@types/order.type";

import { extractImageUrl } from "@/utils/image";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";

interface OrderItemProps {
  item: CartItem;
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemove: (id: string) => void;
}

const OrderItem: React.FC<OrderItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
}) => {
  const { language } = useLanguage();
  const t = translations[language];
  const { product, variant, quantity, id } = item;

  const backendBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  const name = item.name || product?.name || "Product";
  const price = item.price ?? product?.price ?? 0;

  const usableImage =
    extractImageUrl(variant?.images, backendBaseUrl) ||
    extractImageUrl(item.image, backendBaseUrl) ||
    extractImageUrl(product?.images, backendBaseUrl) ||
    extractImageUrl(product?.featuredImage, backendBaseUrl) ||
    "";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 sm:py-3 font-poppins bg-white border-b border-gray-100">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] shrink-0 bg-gray-50 rounded-[16px] overflow-hidden flex items-center justify-center">
          {usableImage ? (
            <Image
              src={usableImage}
              alt={name}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <span className="text-xs text-gray-400 font-medium">No Image</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-[16px] sm:text-[18px] font-medium text-[#7E7E7E] line-clamp-1">
            {name}
          </h4>

          <div className="flex flex-wrap gap-2 my-1.5">
            {variant && (
              <span className="text-[12px] text-[#7E7E7E] font-medium">
                {variant.color && `Color: ${variant.color}`}{" "}
                {variant.size && `| Size: ${variant.size}`}
              </span>
            )}
            {item.variantInfo && Array.isArray(item.variantInfo) && (
              <div className="flex flex-wrap gap-1">
                {item.variantInfo.map(
                  (v: { label?: string; value?: string }, idx: number) => (
                    <span
                      key={idx}
                      className="text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                    >
                      {v.label || "Variant"}: {v.value || "-"}
                    </span>
                  ),
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#FF7050] font-bold text-[18px]">
              {t.product.bdt} {price}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 mt-2 sm:mt-0 pl-[96px] sm:pl-0">
        <div className="flex items-center border border-[#E5E5E5] rounded-[10px] h-9 px-1">
          <button
            onClick={() => onUpdateQuantity(id, quantity - 1)}
            disabled={quantity <= 1}
            className="cursor-pointer w-8 text-[#727272] text-xl disabled:opacity-30"
          >
            &minus;
          </button>
          <span className="w-6 text-center text-base font-semibold text-[#4D4D4D]">
            {quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(id, quantity + 1)}
            className="cursor-pointer w-8 text-[#727272] text-xl"
          >
            +
          </button>
        </div>

        <button
          onClick={() => onRemove(id)}
          className="cursor-pointer text-[#8C8C8C] hover:text-red-500 transition-colors p-1"
        >
          <RiDeleteBin6Line size={20} />
        </button>
      </div>
    </div>
  );
};

export default OrderItem;
