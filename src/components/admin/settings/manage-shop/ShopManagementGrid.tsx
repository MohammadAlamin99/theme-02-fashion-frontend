"use client";

import React from "react";
import {
  Truck,
  CreditCard,
  Target,
  Link2,
  MessageSquareMore,
  CircleDollarSign,
} from "lucide-react";

// --- Types ---
interface ShopFeature {
  title: string;
  description: string;
  icon: React.ElementType;
}

// --- Card Data ---
const shopFeatures: ShopFeature[] = [
  {
    title: "Delivery Charge",
    description:
      "Manage your shop's delivery settings to ensure smooth and efficient order fulfillment.",
    icon: Truck,
  },
  {
    title: "Payment Gateway",
    description:
      "Integrate and manage payment options to provide customers with secure and flexible transaction methods.",
    icon: CreditCard,
  },
  {
    title: "Marketing Integrations",
    description:
      "Enhance your shop's visibility by Google Tag Manager, Facebook Pixel, TikTok Pixel, and SEO tools for better engagement.",
    icon: Target,
  },
  {
    title: "Shop Domain",
    description:
      "Manage your shop's core configurations, including domain setup and general settings.",
    icon: Link2,
  },
  {
    title: "SMS Support",
    description:
      "Enable SMS notifications and support to keep your customers informed with real-time updates.",
    icon: MessageSquareMore,
  },
  {
    title: "Reward Point",
    description:
      "Enable SMS notifications and support to keep your customers informed with real-time updates.",
    icon: CircleDollarSign,
  },
];

const ShopManagementGrid = () => {
  return (
    <div className="w-full font-lato">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shopFeatures.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-[8px] p-6 flex items-start justify-between gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            {/* Text Content */}
            <div className="flex flex-col gap-2">
              <h3 className="text-[18px] font-bold text-black leading-none">
                {feature.title}
              </h3>
              <p className="text-[12px] text-[#777777] font-normal font-poppins leading-relaxed">
                {feature.description}
              </p>
            </div>

            {/* Icon Container */}
            <div className="bg-[#FFF8F1] rounded-[8px] p-4 flex items-center justify-center shrink-0">
              <feature.icon
                size={32}
                className="text-[#FF6A00]"
                strokeWidth={1.5}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopManagementGrid;
