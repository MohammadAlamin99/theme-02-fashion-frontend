import { apiFetch } from "@/utils/api";
import { getAdminTokenAction } from "@/app/actions/auth";

export interface BrandQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

// 🚀 1. FETCH ALL BRANDS PAGINATED
export const fetchAllBrands = async (query: BrandQuery) => {
  const queryParams = new URLSearchParams();
  if (query.page) queryParams.set("page", String(query.page));
  if (query.limit) queryParams.set("limit", String(query.limit));
  if (query.search) queryParams.set("search", query.search);
  if (query.status) queryParams.set("status", query.status);

  const res = await apiFetch(`/brand?${queryParams.toString()}`);
  if (!res.ok) throw new Error("Failed to retrieve brands collection array.");

  const json = await res.json();
  const records = json?.data?.data || json?.data || json || [];
  const meta = json?.data?.meta || json?.meta || { totalPages: 1, total: 0 };

  return { data: Array.isArray(records) ? records : [], meta };
};

// 🚀 2. FETCH SINGLE BRAND RECORD FOR EDIT PRE-POPULATION
export const fetchSingleBrand = async (id: string) => {
  const res = await apiFetch(`/brand/${id}`);
  if (!res.ok) throw new Error("Could not fetch specified brand records.");
  const json = await res.json();
  return json?.data || json;
};

// 🚀 3. DELETE SINGLE BRAND RECORD
export const deleteBrand = async (id: string) => {
  const token = await getAdminTokenAction();
  const res = await apiFetch(`/brand/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token || ""}` },
  });
  if (!res.ok) throw new Error("Failed to delete brand record.");
  return res.json();
};

// 🚀 4. UPLOAD BRAND GRAPHIC LOGO TO STORAGE
export const uploadBrandImage = async (file: File) => {
  const token = await getAdminTokenAction();
  const formData = new FormData();
  formData.append("image", file);

  const res = await apiFetch("/brand/upload-image", {
    method: "POST",
    headers: { Authorization: `Bearer ${token || ""}` },
    body: formData,
  });

  if (!res.ok)
    throw new Error(
      "Failed to process brand graphic file stream asset upload.",
    );

  const data = await res.json();
  // 🚀 FIXED: Extract the correct 'logo_url' attribute returned from your NestJS controller
  return { logo_url: data?.logo_url || data?.data?.logo_url || "" };
};

// 🚀 5. CREATE NEW BRAND
export const createBrand = async (payload: {
  name: string;
  slug: string;
  priority?: number;
  logo_url?: string; // 🚀 FIXED: Changed from image_url to match CreateBrandDto
  status: "active" | "draft";
}) => {
  const token = await getAdminTokenAction();
  const res = await apiFetch("/brand", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token || ""}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorJson = await res.json();
    throw new Error(
      errorJson?.message || "Failed to finalize brand creation record.",
    );
  }
  return res.json();
};

// 🚀 6. UPDATE EXISTING BRAND RECORD
export const updateBrand = async (
  id: string,
  payload: {
    name: string;
    slug: string;
    priority?: number;
    logo_url?: string; // 🚀 FIXED: Changed from image_url to match UpdateBrandDto
    status: "active" | "draft";
  },
) => {
  const token = await getAdminTokenAction();
  const res = await apiFetch(`/brand/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token || ""}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorJson = await res.json();
    throw new Error(
      errorJson?.message || "Failed to execute brand record update changes.",
    );
  }
  return res.json();
};

// ================= store front  ====================

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  meta_title?: string;
  meta_description?: string;
  meta_tags?: string;
  status: "active" | "inactive" | string;
  _count?: { products: number };
}

export interface BrandResponse {
  success: boolean;
  statusCode: number;
  data: {
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    data: Brand[];
  };
}

export const getBrands = async (
  page = 1,
  limit = 20,
): Promise<BrandResponse> => {
  const res = await apiFetch(`/brand?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch brands");
  return res.json();
};
