// import { apiFetch } from "@/utils/api";
// import Cookies from "js-cookie";
// export interface ApplyCouponPayload {
//   code: string;
//   directOrderData?: {
//     productId?: string;
//     variantId?: string;
//     quantity?: number;
//   };
// }

// export interface CreateCouponPayload {
//   code: string;
//   discountType: "PERCENTAGE" | "FIXED";
//   discountValue: number;
//   minOrderValue?: number;
//   maxDiscount?: number;
//   usageLimit?: number;
//   expiresAt: string;
//   isActive: boolean;
// }

// export interface Coupon {
//   id: string;
//   code: string;
//   discountType: "PERCENTAGE" | "FIXED" | string;
//   discountValue: number;
//   minOrderValue?: number | null;
//   maxDiscount?: number | null;
//   usageLimit?: number | null;
//   usedCount?: number;
//   expiresAt: string;
//   isActive: boolean;
//   [key: string]: unknown;
// }

// export interface CouponResponse {
//   success: boolean;
//   message: string;
//   discountAmount?: number;
//   discountType?: "FLAT" | "PERCENTAGE" | string;
//   discountValue?: number;
//   couponCode?: string;
//   // backend may return different shape — keep flexible
//   data?: {
//     discountAmount?: number;
//     discountType?: string;
//     discountValue?: number;
//     couponCode?: string;
//     [key: string]: unknown;
//   };
// }

// export const applyCouponService = async (
//   payload: ApplyCouponPayload,
// ): Promise<CouponResponse> => {
//   const response = await apiFetch("/coupons/apply", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });

//   const result = await response.json();

//   if (!response.ok) {
//     throw new Error(result.message || "Invalid or expired coupon");
//   }

//   return result;
// };

// // create cupon for admin
// export const createCouponService = async (payload: CreateCouponPayload) => {
//   const token = Cookies.get("accessToken");
//   const response = await apiFetch("/coupons", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       ...(token && { Authorization: `Bearer ${token}` }),
//     },
//     body: JSON.stringify(payload),
//   });
//   const result = await response.json();
//   if (!response.ok)
//     throw new Error(result.message || "Failed to create coupon");
//   return result;
// };

// // update coupon for admin
// export const updateCouponService = async (
//   id: string,
//   payload: Partial<CreateCouponPayload>,
// ) => {
//   const token = Cookies.get("accessToken");
//   const response = await apiFetch(`/coupons/${id}`, {
//     method: "PATCH", // Use PATCH for partial updates
//     headers: {
//       "Content-Type": "application/json",
//       ...(token && { Authorization: `Bearer ${token}` }),
//     },
//     body: JSON.stringify(payload),
//   });
//   const result = await response.json();
//   if (!response.ok)
//     throw new Error(result.message || "Failed to update coupon");
//   return result;
// };

// // / get all coupons for admin
// export const getAllCouponsService = async (): Promise<Coupon[]> => {
//   const token = Cookies.get("accessToken");
//   const response = await apiFetch("/coupons", {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       ...(token && { Authorization: `Bearer ${token}` }),
//     },
//   });
//   const result = await response.json();
//   if (!response.ok)
//     throw new Error(result.message || "Failed to fetch coupons");
//   return result;
// };

// // delete coupon for admin
// export const deleteCouponService = async (id: string) => {
//   const token = Cookies.get("accessToken");
//   const response = await apiFetch(`/coupons/${id}`, {
//     method: "DELETE",
//     headers: {
//       "Content-Type": "application/json",
//       ...(token && { Authorization: `Bearer ${token}` }),
//     },
//   });
//   const result = await response.json();
//   if (!response.ok)
//     throw new Error(result.message || "Failed to delete coupon");
//   return result;
// };

import { apiFetch } from "@/utils/api";
import Cookies from "js-cookie";
export interface ApplyCouponPayload {
  code: string;
  directOrderData?: {
    productId?: string;
    variantId?: string;
    quantity?: number;
  };
}

export interface CreateCouponPayload {
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  expiresAt: string;
  isActive: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED" | string;
  discountValue: number;
  minOrderValue?: number | null;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usedCount?: number;
  expiresAt: string;
  isActive: boolean;
  [key: string]: unknown;
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

// create cupon for admin
export const createCouponService = async (payload: CreateCouponPayload) => {
  const token = Cookies.get("accessToken");
  const response = await apiFetch("/coupons", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.message || "Failed to create coupon");
  return result;
};

// update coupon for admin
export const updateCouponService = async (
  id: string,
  payload: Partial<CreateCouponPayload>,
) => {
  const token = Cookies.get("accessToken");
  const response = await apiFetch(`/coupons/${id}`, {
    method: "PATCH", // Use PATCH for partial updates
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.message || "Failed to update coupon");
  return result;
};

// / get all coupons for admin
export const getAllCouponsService = async (): Promise<Coupon[]> => {
  const token = Cookies.get("accessToken");
  const response = await apiFetch("/coupons", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.message || "Failed to fetch coupons");
  return result;
};

// delete coupon for admin
export const deleteCouponService = async (id: string) => {
  const token = Cookies.get("accessToken");
  const response = await apiFetch(`/coupons/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.message || "Failed to delete coupon");
  return result;
};
