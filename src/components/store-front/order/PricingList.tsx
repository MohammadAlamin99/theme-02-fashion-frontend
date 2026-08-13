import { CartItem } from "@/@types/order.type";
import { translations } from "@/locales";
import { useLanguage } from "@/providers/LanguageProvider";
import React from "react";

interface PricingListProps {
  items: CartItem[];
  shippingFee: number;
  couponDiscount?: number;
}

const PricingList: React.FC<PricingListProps> = ({
  items = [],
  shippingFee,
  couponDiscount = 0,
}) => {
  const { language } = useLanguage();
  const t = translations[language];
  // Calculate Total Product Cost (Price * Quantity)
  const totalProductCost = items.reduce((acc, item) => {
    const rawPrice = item.price ?? item.product?.price ?? 0;
    const priceNum =
      typeof rawPrice === "number" ? rawPrice : parseFloat(rawPrice) || 0;
    return acc + priceNum * (item.quantity || 1);
  }, 0);

  const subtotal = totalProductCost - couponDiscount;
  const payableAmount = subtotal + shippingFee;

  return (
    <div className="mt-20 font-poppins">
      <h3 className="font-semibold text-xl mb-4 text-black">
        {t.pricing.pricingList}
      </h3>
      <div className="flex flex-col gap-3 text-lg text-[#727272] bg-[#F9F9F9] p-6 rounded-[12px]">
        <div className="flex justify-between">
          <span>{t.pricing.totalProductCost}</span>
          <span className="font-semibold">
            {totalProductCost} {t.pricing.currency}
          </span>
        </div>

        <div className="flex justify-between">
          <span>{t.pricing.couponDiscount}</span>
          <span className="font-medium text-red-500">
            {couponDiscount > 0 ? `-${couponDiscount}` : "0"}{" "}
            {t.pricing.currency}
          </span>
        </div>

        <hr className="border-dashed border-gray-200 my-1" />

        <div className="flex justify-between">
          <span>{t.pricing.subtotal}</span>
          <span className="font-medium">
            {subtotal} {t.pricing.currency}
          </span>
        </div>

        <div className="flex justify-between">
          <span>{t.pricing.shippingFee}</span>
          <span className="font-medium">
            {shippingFee} {t.pricing.currency}
          </span>
        </div>

        <hr className="border-gray-200 my-1" />

        <div className="flex justify-between items-center mt-2">
          <span className="text-xl font-semibold text-[#FF7050]">
            {t.pricing.payableAmount}
          </span>
          <span className="text-xl font-semibold text-[#FF7050]">
            {payableAmount} {t.pricing.currency}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PricingList;
