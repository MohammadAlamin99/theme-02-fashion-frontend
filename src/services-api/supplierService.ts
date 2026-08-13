import { apiFetch } from "@/utils/api";

// --- TYPES ---
export interface Supplier {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  status: string;
  _count: {
    products: number;
  };
}

export interface SupplierResponse {
  success: boolean;
  data: {
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    data: Supplier[];
  };
}

/**
 * Fetch public suppliers with pagination
 */
export const getSuppliers = async (
  page = 1,
  limit = 5,
): Promise<SupplierResponse> => {
  const res = await apiFetch(`/suppliers?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch suppliers");
  }

  return res.json();
};
