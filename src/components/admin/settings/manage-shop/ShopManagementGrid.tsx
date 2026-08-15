"use client";

import React, { useState, useEffect } from "react";
import {
  Truck,
  CreditCard,
  Target,
  Link2,
  MessageSquareMore,
  CircleDollarSign,
  ArrowLeft,
  Loader2,
  Ticket,
  Trash2,
  X,
  Pencil, // Added for Edit
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchShippingSettings,
  updateShippingSettings,
  ShippingSettingsData,
} from "@/services-api/shippingService";
import {
  CreateCouponPayload,
  Coupon,
  createCouponService,
  getAllCouponsService,
  deleteCouponService,
  updateCouponService, // Added service
} from "@/services-api/couponService";
import { toast } from "react-hot-toast";

interface ShopFeature {
  title: string;
  description: string;
  icon: React.ElementType;
  id: string;
}

interface DeliveryChargeRow {
  location: string;
  price: string;
  key: string;
}

interface CouponFormState {
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: string;
  minOrderValue: string;
  maxDiscount: string;
  usageLimit: string;
  expiresAt: string;
  isActive: boolean;
}

const shopFeatures: ShopFeature[] = [
  {
    id: "delivery",
    title: "Delivery Charge",
    description:
      "Manage your shop’s delivery settings to ensure smooth and efficient order fulfillment.",
    icon: Truck,
  },
  {
    id: "payment",
    title: "Payment Gateway",
    description:
      "Integrate and manage payment options to provide customers with secure and flexible transaction methods.",
    icon: CreditCard,
  },
  {
    id: "marketing",
    title: "Marketing Integrations",
    description:
      "Enhance your shop’s visibility by Google Tag Manager, Facebook Pixel, TikTok Pixel, and SEO tools for better engagement.",
    icon: Target,
  },
  {
    id: "domain",
    title: "Shop Domain",
    description:
      "Manage your shop’s core configurations, including domain setup and general settings.",
    icon: Link2,
  },
  {
    id: "sms",
    title: "SMS Support",
    description:
      "Enable SMS notifications and support to keep your customers informed with real-time updates.",
    icon: MessageSquareMore,
  },
  {
    id: "reward",
    title: "Reward Point",
    description:
      "Activate SMS-based OTP verification to enhance account security and provide customers with instant, reliable authentication codes.",
    icon: CircleDollarSign,
  },
  {
    id: "coupon",
    title: "Coupon Code",
    description: "Create and manage coupon codes for your shop.",
    icon: Ticket,
  },
];

const shippingSettingsQueryKey = ["shippingSettings"] as const;
const couponsQueryKey = ["coupons"] as const;

const emptyCouponForm: CouponFormState = {
  code: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  minOrderValue: "",
  maxDiscount: "",
  usageLimit: "",
  expiresAt: "",
  isActive: true,
};

const ShopManagementGrid = () => {
  const [activeView, setActiveView] = useState<string>("grid");
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const [deliveryCharges, setDeliveryCharges] = useState<DeliveryChargeRow[]>([
    { location: "Inside Dhaka", price: "", key: "inside" },
    { location: "Outside Dhaka", price: "", key: "outside" },
    { location: "Sub City", price: "", key: "sub_city" },
  ]);

  const [couponForm, setCouponForm] =
    useState<CouponFormState>(emptyCouponForm);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // --- Queries ---
  const { data: shippingSettings, isLoading: isLoadingShipping } = useQuery({
    queryKey: shippingSettingsQueryKey,
    queryFn: fetchShippingSettings,
    enabled: activeView === "delivery",
  });

  const { data: coupons, isLoading: isLoadingCoupons } = useQuery({
    queryKey: couponsQueryKey,
    queryFn: getAllCouponsService,
    enabled: activeView === "coupon",
    select: (response: unknown): Coupon[] => {
      if (Array.isArray(response)) return response;
      const wrapped = response as {
        data?: Coupon[];
        coupons?: Coupon[];
      } | null;
      return wrapped?.data ?? wrapped?.coupons ?? [];
    },
  });

  // Safe side effect: only update deliveryCharges when fresh shippingSettings data is fetched
  useEffect(() => {
    if (shippingSettings?.courier_config) {
      const { inside, outside, sub_city } = shippingSettings.courier_config;
      setDeliveryCharges([
        {
          location: "Inside Dhaka",
          price: String(inside || ""),
          key: "inside",
        },
        {
          location: "Outside Dhaka",
          price: String(outside || ""),
          key: "outside",
        },
        {
          location: "Sub City",
          price: String(sub_city || ""),
          key: "sub_city",
        },
      ]);
    }
  }, [shippingSettings]);

  // --- Mutations ---
  const updateShippingMutation = useMutation({
    mutationFn: (payload: Partial<ShippingSettingsData>) =>
      updateShippingSettings(payload),
    onSuccess: () => {
      toast.success("Settings saved successfully!");
      queryClient.invalidateQueries({ queryKey: shippingSettingsQueryKey });
      setActiveView("grid");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const couponMutation = useMutation({
    mutationFn: (payload: CreateCouponPayload) =>
      editingCouponId
        ? updateCouponService(editingCouponId, payload)
        : createCouponService(payload),
    onSuccess: () => {
      toast.success(editingCouponId ? "Coupon updated!" : "Coupon created!");
      queryClient.invalidateQueries({ queryKey: couponsQueryKey });
      closeCouponModal();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteCouponMutation = useMutation({
    mutationFn: (id: string) => deleteCouponService(id),
    onSuccess: () => {
      toast.success("Coupon deleted!");
      queryClient.invalidateQueries({ queryKey: couponsQueryKey });
    },
  });

  // --- Handlers ---
  const handleCouponChange = (
    field: keyof CouponFormState,
    value: string | boolean,
  ) => {
    setCouponForm((prev) => ({ ...prev, [field]: value }));
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCouponId(coupon.id);
    setCouponForm({
      code: coupon.code,
      discountType: coupon.discountType as "PERCENTAGE" | "FIXED",
      discountValue: String(coupon.discountValue),
      minOrderValue: String(coupon.minOrderValue ?? ""),
      maxDiscount: String(coupon.maxDiscount ?? ""),
      usageLimit: String(coupon.usageLimit ?? ""),
      expiresAt: coupon.expiresAt
        ? new Date(coupon.expiresAt).toISOString().slice(0, 16)
        : "",
      isActive: coupon.isActive,
    });
    setIsCouponModalOpen(true);
  };

  const closeCouponModal = () => {
    setIsCouponModalOpen(false);
    setEditingCouponId(null);
    setCouponForm(emptyCouponForm);
  };

  const handleSaveCoupon = () => {
    if (
      !couponForm.code ||
      !couponForm.discountValue ||
      !couponForm.expiresAt
    ) {
      toast.error("Please fill required fields");
      return;
    }
    const payload: CreateCouponPayload = {
      code: couponForm.code,
      discountType: couponForm.discountType,
      discountValue: Number(couponForm.discountValue),
      minOrderValue: Number(couponForm.minOrderValue) || 0,
      maxDiscount: Number(couponForm.maxDiscount) || 0,
      usageLimit: Number(couponForm.usageLimit) || 0,
      expiresAt: new Date(couponForm.expiresAt).toISOString(),
      isActive: couponForm.isActive,
    };
    couponMutation.mutate(payload);
  };

  // --- Views ---
  if (activeView === "delivery") {
    return (
      <div className="w-full font-lato bg-white p-6 rounded-lg font-poppins">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setActiveView("grid")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold">Delivery Charge Settings</h2>
        </div>
        {isLoadingShipping ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : (
          <div className="space-y-4">
            {deliveryCharges.map((row, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-8">
                  <input
                    type="text"
                    readOnly
                    value={row.location}
                    className="w-full p-2 border border-gray-200 bg-gray-50 rounded-md text-gray-500 cursor-default"
                  />
                </div>
                <div className="col-span-4">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={row.price}
                    onChange={(e) => {
                      const updated = [...deliveryCharges];
                      updated[index].price = e.target.value;
                      setDeliveryCharges(updated);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#FF6A00] outline-none"
                  />
                </div>
              </div>
            ))}
            <div className="pt-4">
              <button
                disabled={updateShippingMutation.isPending}
                onClick={() => {
                  const payload: Partial<ShippingSettingsData> = {
                    courier_config: {
                      inside: Number(deliveryCharges[0].price) || 0,
                      outside: Number(deliveryCharges[1].price) || 0,
                      sub_city: Number(deliveryCharges[2].price) || 0,
                    },
                    default_shipping_fee: Number(deliveryCharges[0].price) || 0,
                  };
                  updateShippingMutation.mutate(payload);
                }}
                className="px-6 py-2 bg-[#FF6A00] text-white rounded-md font-medium flex items-center gap-2"
              >
                {updateShippingMutation.isPending && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                {updateShippingMutation.isPending
                  ? "Saving..."
                  : "Save Settings"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeView === "coupon") {
    return (
      <div className="w-full bg-white p-6 rounded-lg font-poppins">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveView("grid")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold">Coupon Codes</h2>
          </div>
          <button
            onClick={() => {
              setEditingCouponId(null);
              setCouponForm(emptyCouponForm);
              setIsCouponModalOpen(true);
            }}
            className="px-6 py-2 bg-[#FF6A00] text-white rounded-md font-medium"
          >
            Create Coupon
          </button>
        </div>

        {isLoadingCoupons ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-100">
                  <th className="py-2 pr-4 font-semibold">Code</th>
                  <th className="py-2 pr-4 font-semibold">Discount</th>
                  <th className="py-2 pr-4 font-semibold">Max Cap</th>
                  <th className="py-2 pr-4 font-semibold">Usage</th>
                  <th className="py-2 pr-4 font-semibold">Expires</th>
                  <th className="py-2 pr-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {coupons?.map((coupon: Coupon) => (
                  <tr
                    key={coupon.id}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="py-3 pr-4 font-medium">{coupon.code}</td>
                    <td className="py-3 pr-4">
                      {coupon.discountType === "PERCENTAGE"
                        ? `${coupon.discountValue}%`
                        : `${coupon.discountValue} TK`}
                    </td>
                    <td className="py-3 pr-4">
                      {coupon.discountType === "PERCENTAGE"
                        ? `${coupon.maxDiscount || 0} TK`
                        : "Flat"}
                    </td>

                    <td className="py-3 pr-4">
                      {coupon.usedCount ?? 0} / {coupon.usageLimit || "∞"}
                    </td>
                    <td className="py-3 pr-4">
                      {coupon.expiresAt
                        ? new Date(coupon.expiresAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="py-3 pr-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(coupon)}
                        className="p-2 hover:bg-orange-50 text-[#FF6A00] rounded-md transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() =>
                          window.confirm("Delete this coupon?") &&
                          deleteCouponMutation.mutate(coupon.id)
                        }
                        className="p-2 hover:bg-red-50 text-red-500 transition-colors"
                      >
                        {deleteCouponMutation.isPending &&
                        deleteCouponMutation.variables === coupon.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isCouponModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={closeCouponModal}
          >
            <div
              className="w-full max-w-2xl bg-white rounded-lg p-6 font-poppins max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {editingCouponId ? "Edit Coupon" : "Create New Coupon"}
                </h2>
                <button
                  onClick={closeCouponModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    value={couponForm.code}
                    onChange={(e) => handleCouponChange("code", e.target.value)}
                    className="p-2 border border-gray-300 rounded-md outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600">
                    Type
                  </label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) =>
                      handleCouponChange("discountType", e.target.value as any)
                    }
                    className="p-2 border border-gray-300 rounded-md outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed (TK)</option>
                  </select>
                </div>
                {/* Max Discount Input */}
                {couponForm.discountType === "PERCENTAGE" && (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-600">
                      Max Discount (TK)
                    </label>
                    <input
                      type="number"
                      value={couponForm.maxDiscount}
                      onChange={(e) =>
                        handleCouponChange("maxDiscount", e.target.value)
                      }
                      className="p-2 border border-gray-300 rounded-md outline-none"
                      placeholder="e.g. 200"
                    />
                  </div>
                )}

                {/* Usage Limit Input */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    value={couponForm.usageLimit}
                    onChange={(e) =>
                      handleCouponChange("usageLimit", e.target.value)
                    }
                    className="p-2 border border-gray-300 rounded-md outline-none"
                    placeholder="e.g. 100"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600">
                    Value (Amount/%) *
                  </label>
                  <input
                    type="number"
                    value={couponForm.discountValue}
                    onChange={(e) =>
                      handleCouponChange("discountValue", e.target.value)
                    }
                    className="p-2 border border-gray-300 rounded-md outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600">
                    Min Order Value
                  </label>
                  <input
                    type="number"
                    value={couponForm.minOrderValue}
                    onChange={(e) =>
                      handleCouponChange("minOrderValue", e.target.value)
                    }
                    className="p-2 border border-gray-300 rounded-md outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600">
                    Expiry Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={couponForm.expiresAt}
                    onChange={(e) =>
                      handleCouponChange("expiresAt", e.target.value)
                    }
                    className="p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#FF6A00] outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    checked={couponForm.isActive}
                    onChange={(e) =>
                      handleCouponChange("isActive", e.target.checked)
                    }
                    className="w-4 h-4 accent-[#FF6A00]"
                  />
                  <label className="text-sm font-semibold text-gray-600">
                    Is Active
                  </label>
                </div>
              </div>
              <div className="mt-8">
                <button
                  disabled={couponMutation.isPending}
                  onClick={handleSaveCoupon}
                  className="px-8 py-2 bg-[#FF6A00] text-white rounded-md font-medium flex items-center gap-2"
                >
                  {couponMutation.isPending && (
                    <Loader2 size={18} className="animate-spin" />
                  )}
                  {editingCouponId ? "Update Coupon" : "Create Coupon"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full font-lato">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shopFeatures.map((feature) => (
          <div
            key={feature.id}
            onClick={() => setActiveView(feature.id)}
            className="bg-white rounded-[8px] p-6 flex items-start justify-between gap-4 cursor-pointer hover:shadow-md hover:border-[#FF6A00] border border-transparent transition-all"
          >
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-semibold text-black leading-none">
                {feature.title}
              </h3>
              <p className="text-[12px] text-black font-normal font-poppins leading-relaxed">
                {feature.description}
              </p>
            </div>
            <div className="bg-[#FFF8F1] rounded-[8px] p-5 flex items-center justify-center shrink-0">
              <feature.icon
                size={38}
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
