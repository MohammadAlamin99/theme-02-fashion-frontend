/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { ArrowLeft, Loader2, Trash2, X, Pencil } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateCouponPayload,
  Coupon,
  createCouponService,
  getAllCouponsService,
  deleteCouponService,
  updateCouponService,
} from "@/services-api/couponService";
import { toast } from "react-hot-toast";

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

const CupponContent = () => {
  const [activeView, setActiveView] = useState<string>("grid");
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const [couponForm, setCouponForm] =
    useState<CouponFormState>(emptyCouponForm);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // --- Queries ---
  const { data: coupons, isLoading: isLoadingCoupons } = useQuery({
    queryKey: couponsQueryKey,
    queryFn: getAllCouponsService,
    select: (response: any): Coupon[] => {
      if (Array.isArray(response)) return response;
      return response?.data ?? response?.coupons ?? [];
    },
  });

  // --- Mutations ---
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
  return (
    <div className="w-full font-lato">
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
                {!coupons || coupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400 italic">
                      No coupons found. Create your first coupon!
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon: Coupon) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal Popup */}
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
                    className="p-2 border border-gray-300 rounded-md outline-none focus:border-[#FF6A00]"
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
    </div>
  );
};

export default CupponContent;
