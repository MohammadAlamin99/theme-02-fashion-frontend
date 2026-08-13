import { apiFetch } from "@/utils/api";

export interface ApplyCouponPayload {
  code: string;
  directOrderData?: {
    productId?: string;
    variantId?: string;
    quantity?: number;
  };
}

export interface CouponResponse {
  success: boolean;
  message: string;
  discountAmount?: number;
  discountType?: "FLAT" | "PERCENTAGE" | string;
  discountValue?: number;
  couponCode?: string;
  // backend may return different shape — keep flexible
  data?: {
    discountAmount?: number;
    discountType?: string;
    discountValue?: number;
    couponCode?: string;
    [key: string]: unknown;
  };
}

export const applyCouponService = async (
  payload: ApplyCouponPayload,
): Promise<CouponResponse> => {
  const response = await apiFetch("/coupons/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Invalid or expired coupon");
  }

  return result;
};
