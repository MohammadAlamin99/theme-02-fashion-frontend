"use client";
import { useState } from "react";
import TabItem from "../../catalog/TabItem";
import { usePathname, useRouter } from "next/navigation";
import ShopManagementGrid from "./ShopManagementGrid";
import DeliveryChargeContent from "./DeliveryChargeContent"; // Import the new content
import { User, ChevronLeft } from "lucide-react";
import ContentIcon from "@/components/store-front/svg/svg/ContentIcon";
import ChatInterfaceIcon from "@/components/store-front/svg/svg/ChatInterfaceIcon";
import ShopSettingsIcon from "@/components/store-front/svg/svg/ShopSettingsIcon";
import PaymentGatewayContent from "./PaymentGatewayContent";
import MarketingIntegrationsContent from "./MarketingIntegrationsContent";
import ShopDomainContent from "./ShopDomainContent";
import SMSSupportContent from "./SMSSupportContent";
import OTPVerificationContent from "./OTPVerificationContent";
import CupponContent from "./CupponContent";

export default function ShopSettingsPage() {
  const router = useRouter();
  const pathname = usePathname();

  // State to track if we are viewing the grid or a specific tab
  const [activeInternalTab, setActiveInternalTab] = useState<string | null>(
    null,
  );

  const mainTabs = [
    {
      id: "web",
      label: "Website Information",
      icon: ContentIcon,
      path: "/admin/dashboard/settings/information",
    },
    {
      id: "chat",
      label: "Chat Settings",
      icon: ChatInterfaceIcon,
      path: "/admin/dashboard/settings/chat",
    },
    {
      id: "shop",
      label: "Manage Shop",
      icon: ShopSettingsIcon,
      path: "/admin/dashboard/settings/manage-shop",
    },
    {
      id: "profile",
      label: "Profile Details",
      icon: User,
      path: "/admin/dashboard/settings/profile",
    },
  ];

  const subTabs = [
    { id: "delivery", label: "Delivery Charge" },
    { id: "payment", label: "Payment Gateway" },
    { id: "integrations", label: "Integrations" },
    { id: "domain", label: "Shop Domain" },
    { id: "sms", label: "SMS Support" },
    { id: "coupon", label: "Coupon Code" },
    // { id: "otp", label: "OTP Verification" },
  ];

  return (
    <div className="w-full font-lato bg-[#FAFAFA]">
      {/* 1. Main Header Tabs */}
      <div className="bg-white p-8">
        <h1 className="text-2xl font-bold text-[#003032] mb-6">Settings</h1>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {mainTabs.map((tab) => (
            <TabItem
              key={tab.id}
              label={tab.label}
              icon={tab.icon}
              isActive={pathname === tab.path}
              onClick={() => {
                setActiveInternalTab(null);
                router.push(tab.path);
              }}
            />
          ))}
        </div>
      </div>

      {/* 2. Content Area */}
      <div className="mt-4">
        {!activeInternalTab ? (
          /* Initial State: Show Grid */
          <ShopManagementGrid onSelect={(id) => setActiveInternalTab(id)} />
        ) : (
          /* Detailed State: Show Sub-Tabs + Content */
          <div className="animate-in slide-in-from-right-4 duration-300">
            {/* Back Button */}
            <button
              onClick={() => setActiveInternalTab(null)}
              className="flex items-center gap-1 text-gray-500 hover:text-black mb-6 text-base cursor-pointer font-medium font-poppins transition-all"
            >
              <ChevronLeft size={20} /> Back
            </button>

            {/* Figma-style Sub-Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none mb-8">
              {subTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveInternalTab(tab.id)}
                  className={`px-6 py-3 rounded-lg text-[16px] cursor-pointer font-poppins font-normal border transition-all whitespace-nowrap ${
                    activeInternalTab === tab.id
                      ? "bg-white border-[#1E90FF] text-black"
                      : "bg-white border-gray-100 text-black hover:border-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sub-Tab Content Rendering */}
            <div className="mt-4">
              {activeInternalTab === "delivery" && <DeliveryChargeContent />}

              {/* Render Payment Gateway here */}
              {activeInternalTab === "payment" && <PaymentGatewayContent />}

              {activeInternalTab === "integrations" && (
                <MarketingIntegrationsContent />
              )}

              {activeInternalTab === "domain" && <ShopDomainContent />}

              {activeInternalTab === "sms" && <SMSSupportContent />}
              {/* {activeInternalTab === "otp" && <OTPVerificationContent />} */}
              {activeInternalTab === "coupon" && <CupponContent />}

              {/* Fallback for other tabs */}
              {activeInternalTab !== "delivery" &&
                activeInternalTab !== "payment" &&
                activeInternalTab !== "integrations" &&
                activeInternalTab !== "domain" &&
                activeInternalTab !== "sms" &&
                activeInternalTab !== "otp" &&
                activeInternalTab !== "coupon" && (
                  <div className="bg-white p-20 rounded-2xl border text-center text-gray-300 italic">
                    {subTabs.find((t) => t.id === activeInternalTab)?.label}{" "}
                    hellow world
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
