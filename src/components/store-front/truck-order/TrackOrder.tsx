"use client";
import React, { useState } from "react";
import {
  FaTrashAlt,
  FaSpinner,
  FaSearch,
} from "react-icons/fa";
import {
  trackOrderService,
  TrackedOrderResponse,
  TrackedOrderItem,
  TrackedOrderTimeline,
} from "@/services-api/trackOrderService";
import toast from "react-hot-toast";
import { useLanguage } from "@/providers/LanguageProvider";
import { translations } from "@/locales";

const TrackOrder: React.FC = () => {
  const [orderInput, setOrderInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [orderData, setOrderData] = useState<TrackedOrderResponse | null>(null);
  const { language } = useLanguage();
  const t = translations[language];
  const handleTrackOrder = async (
    e?: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    if (e) e.preventDefault();

    const trimmedId = orderInput.trim();
    if (!trimmedId) {
      toast.error("Please enter a valid Order ID");
      return;
    }

    try {
      setLoading(true);
      const res = await trackOrderService(trimmedId);
      setOrderData(res);
      toast.success("Order details fetched successfully!");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Order not found. Please check your Order ID.";
      toast.error(message);
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  };

  const clearInput = (): void => {
    setOrderInput("");
    setOrderData(null);
  };

  // Helper getters
  const orderIdText: string = orderData?.order_number || orderData?.id || "";
  const customerName: string = orderData?.customer_name || "N/A";
  const customerPhone: string = orderData?.customer_phone || "N/A";
  const customerAddress: string = orderData?.customer_address || "N/A";
  const itemList: TrackedOrderItem[] = orderData?.order_items || [];

  // Build timeline status items dynamically if backend doesn't return full timeline
  const buildTimeline = (): TrackedOrderTimeline[] => {
    if (orderData?.timeline && orderData.timeline.length > 0) {
      return orderData.timeline;
    }
    if (!orderData) return [];

    const currentStatus = (orderData.status || "PENDING").toUpperCase();
    const createdDate = orderData.created_at || new Date().toISOString();
    const updatedDate = orderData.updated_at || new Date().toISOString();

    const formattedCreated = new Date(createdDate).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const formattedUpdated = new Date(updatedDate).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const statusSteps: { key: string; label: string; desc: string }[] = [
      {
        key: "PENDING",
        label: "Order Created",
        desc: "Your order request has been received.",
      },
      {
        key: "CONFIRMED",
        label: "Order Confirmed",
        desc: "Your order has been verified and confirmed.",
      },
      {
        key: "PROCESSING",
        label: "Processing",
        desc: "Items are being packed and readied for dispatch.",
      },
      {
        key: "SHIPPED",
        label: "On Shipping",
        desc: "Your order is handed over to courier partner.",
      },
      {
        key: "DELIVERED",
        label: "Order Delivered",
        desc: "Order delivered successfully.",
      },
    ];

    const currentIdx = statusSteps.findIndex((s) => s.key === currentStatus);
    const activeIdx = currentIdx >= 0 ? currentIdx : 0;

    return statusSteps
      .slice(0, activeIdx + 1)
      .reverse()
      .map((step, index) => ({
        status: step.label,
        date: index === 0 ? formattedUpdated : formattedCreated,
        desc: step.desc,
      }));
  };

  const timelineItems: TrackedOrderTimeline[] = buildTimeline();

  return (
    <div className="min-h-screen bg-white font-poppins pb-20">
      {/* Header Section */}
      <div className="bg-[#4D4D4D] text-white md:py-32 py-16 px-4 text-center">
        <h1 className="text-3xl md:text-[40px] font-semibold mb-4">
          {t.trackOrder}
        </h1>
        <p className="text-sm md:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
          {t.trackOrderDesc}
        </p>
      </div>

      {/* Search Section (Floating Card) */}
      <div className="max-w-[900px] mx-auto px-4 -mt-14">
        <div className="bg-white p-6 md:p-10 rounded-[24px] shadow-[0px_10px_40px_rgba(0,0,0,0.08)] border border-gray-100">
          <form onSubmit={handleTrackOrder} className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-[#4D4D4D] ml-1">
              {t.orderIdLabel}
            </label>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={orderInput}
                  onChange={(e) => setOrderInput(e.target.value)}
                  placeholder={t.trackPlaceholder}
                  className="w-full bg-white border border-[#E5E5E5] rounded-[15px] py-4 px-6 pr-12 outline-none focus:border-[#FF7050] transition-all text-sm"
                />
                {orderInput && (
                  <FaTrashAlt
                    onClick={clearInput}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 cursor-pointer hover:text-red-500 transition-colors"
                  />
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#FF7050] hover:bg-[#ff5d39] text-white px-10 py-4 rounded-[15px] font-semibold transition-all active:scale-95 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" size={18} />
                    <span>{t.trackLoading}</span>
                  </>
                ) : (
                  <>
                    <FaSearch size={16} />
                    <span>{t.orderButton}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Content Section */}
      {orderData ? (
        <div className="max-w-[1200px] mx-auto px-6 mt-16 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20">
            {/* Left Column: Customer Info */}
            <div className="flex flex-col gap-6 bg-gray-50/50 p-6 md:p-8 rounded-[20px] border border-gray-100">
              <div>
                <h2 className="text-xl font-semibold text-black mb-4">
                  {t.customerInfo}
                </h2>
                <div className="flex flex-col gap-3">
                  <InfoRow label="Name:" value={customerName} />
                  <InfoRow label="Number:" value={customerPhone} />
                  <InfoRow label="Address:" value={customerAddress} />
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-400 mb-1">
                  {t.orderIdReference}
                </p>
                <h3 className="text-lg font-bold text-[#FF7050]">
                  #{orderIdText}
                </h3>
              </div>

              {itemList.length > 0 && (
                <div className="flex flex-col gap-3 border-t border-gray-200 pt-4">
                  <p className="text-xs font-semibold text-gray-400">
                    {t.orderItems}
                  </p>
                  {itemList.map((item, idx) => {
                    const itemName: string =
                      item.product_name || item.product?.name || "Product Item";
                    const itemQty: number = item.quantity || 1;
                    return (
                      <ProductRow
                        key={item.id || idx}
                        qty={`${itemQty}x`}
                        name={itemName}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Order Timeline */}
            <div className="relative pl-2">
              <h2 className="text-xl font-semibold text-black mb-8">
                {t.orderTimeline}
              </h2>
              {timelineItems.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-[#FF7050]" />
                  <div className="flex flex-col gap-10">
                    {timelineItems.map((item, idx) => (
                      <TimelineItem
                        key={idx}
                        status={item.status}
                        date={item.date}
                        desc={item.desc || ""}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  {t.noTimelineRecordsFound}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-[800px] mx-auto text-center mt-20 text-gray-400">
          <p className="text-base">{t.orderIdEnter}</p>
        </div>
      )}
    </div>
  );
};

// Sub-components

interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <div className="flex gap-4">
    <span className="text-sm font-semibold text-black min-w-[80px]">
      {label}
    </span>
    <span className="text-sm text-[#727272]">{value}</span>
  </div>
);

interface ProductRowProps {
  qty: string;
  name: string;
}

const ProductRow: React.FC<ProductRowProps> = ({ qty, name }) => (
  <div className="flex gap-4 text-sm font-medium">
    <span className="text-black font-semibold min-w-[28px]">{qty}</span>
    <span className="text-[#727272]">{name}</span>
  </div>
);

interface TimelineItemProps {
  status: string;
  date: string;
  desc: string;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ status, date, desc }) => (
  <div className="relative pl-10">
    <div className="absolute left-0 top-1.5 w-4 h-4 bg-[#FF7050] rounded-full border-4 border-white ring-1 ring-[#FF7050]" />
    <div className="flex justify-between items-start mb-1 flex-wrap gap-2">
      <h4 className="text-base font-semibold text-black">{status}</h4>
      <span className="text-xs text-gray-400 font-medium">{date}</span>
    </div>
    {desc && (
      <p className="text-xs text-[#727272] leading-relaxed max-w-[450px]">
        {desc}
      </p>
    )}
  </div>
);

export default TrackOrder;
