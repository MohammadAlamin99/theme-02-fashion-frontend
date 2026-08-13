import { apiFetch } from "@/utils/api";
import { getAdminTokenAction } from "@/app/actions/auth";

export const reviewApi = {
  // 🚀 FIXED: Added optional search parameter tracking to catch customer details within the comments view
  async getAll(
    page: number,
    limit: number,
    status: string,
    search: string,
    sort: string = "desc", // 🚀 Added this parameter
    bypassCache = false,
  ) {
    const token = await getAdminTokenAction();
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      status: status || "",
      search: search || "",
      sortOrder: sort.toUpperCase(), // 🚀 Standard backend parameter for ASC/DESC
      bypassCache: String(bypassCache),
    });

    const res = await apiFetch(`/reviews/admin/all?${query.toString()}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token || ""}` },
    });
    return res.json();
  },
  async updateStatus(id: string, status: string) {
    const token = await getAdminTokenAction();
    const res = await apiFetch(`/reviews/admin/${id}/status`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token || ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // Inside reviewService.ts
  async updateDetails(
    id: string,
    rating: number,
    comment: string,
    images: string[],
    createdAt?: string, // 🚀 Added
  ) {
    const token = await getAdminTokenAction();
    const res = await apiFetch(`/reviews/admin/${id}/update`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token || ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rating, comment, images, createdAt }),
    });
    return res.json();
  },

  async delete(id: string) {
    const token = await getAdminTokenAction();
    const res = await apiFetch(`/reviews/admin/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token || ""}` },
    });
    return res.json();
  },

  async getMetrics() {
    const token = await getAdminTokenAction();
    const res = await apiFetch("/reviews/admin/metrics-summary", {
      method: "GET",
      headers: { Authorization: `Bearer ${token || ""}` },
    });
    return res.json();
  },
};

// =========== store front ================

export interface ReviewUser {
  name: string;
  avatar: string | null;
}

export interface Review {
  id: string;
  name: string;
  phone: string;
  email?: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  images: string[];
  status: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  user: ReviewUser;
}

export interface RatingStat {
  _count: {
    rating: number;
  };
  rating: number;
}

export interface ReviewResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    reviews: Review[];
    ratingStats: RatingStat[];
  };
  timestamp: string;
}

export interface CreateReviewInput {
  productId: string;
  rating: number;
  comment: string;
  images: string[];
  name: string;
  phoneNumber: string;
  email?: string;
}

// get all review of a product
export const getReviewsByProduct = async (
  productId: string,
): Promise<ReviewResponse> => {
  const res = await apiFetch(`/reviews/product/${productId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch reviews for this product");
  }

  return res.json();
};

// create review
export const createReview = async (
  data: CreateReviewInput,
): Promise<ReviewResponse> => {
  const token = await getAdminTokenAction();

  const res = await apiFetch(`/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ""}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to create review");
  }

  return res.json();
};

// upload review images
export const uploadReviewImages = async (
  formData: FormData,
): Promise<{ success: boolean; data: { data: string[] } }> => {
  const token = await getAdminTokenAction();

  const res = await apiFetch(`/reviews/upload-images`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token || ""}`,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to upload images");
  }

  return res.json();
};
