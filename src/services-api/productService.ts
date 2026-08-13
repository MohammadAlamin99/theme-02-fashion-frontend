import { apiFetch } from "@/utils/api";
import { getAdminTokenAction } from "@/app/actions/auth";
import { Product } from "@/@types/product.type";

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: string;
  status?: string;
}

// 🚀 1. FETCH ALL PRODUCTS
export const fetchAllProducts = async (query: ProductQuery) => {
  const queryParams = new URLSearchParams();
  if (query.page) queryParams.set("page", String(query.page));
  if (query.limit) queryParams.set("limit", String(query.limit));
  if (query.search) queryParams.set("search", query.search);
  if (query.category_id) queryParams.set("category_id", query.category_id);
  if (query.status) queryParams.set("status", query.status);

  // 🚀 CRITICAL FIX: Explicitly append the cache bypass property to skip database cache matching logic
  queryParams.set("bypassCache", "true");

  const res = await apiFetch(`/products?${queryParams.toString()}`, {
    method: "GET",
  });

  if (!res.ok)
    throw new Error("Failed to sync catalog rows from backend database.");

  const json = await res.json();
  const records = json?.data?.data || json?.data || json || [];
  const meta = json?.data?.meta || json?.meta || { totalPages: 1, total: 0 };

  return { data: Array.isArray(records) ? records : [], meta };
};

// 🚀 2. FETCH SINGLE PRODUCT BY ID FOR PRE-POPULATION
export const fetchSingleProduct = async (id: string) => {
  const res = await apiFetch(`/products/${id}`, {
    method: "GET",
  });
  if (!res.ok)
    throw new Error("Could not retrieve the specified product profiles.");
  const json = await res.json();
  return json?.data || json;
};

// 🚀 3. UPLOAD MULTIPLE IMAGES TO SHARED TAXONOMY INTERCEPTOR
export const uploadProductMedia = async (files: FileList) => {
  const token = await getAdminTokenAction();
  const formData = new FormData();

  Array.from(files).forEach((file) => {
    formData.append("image", file);
  });

  const res = await apiFetch("/categories/upload-image", {
    method: "POST",
    headers: { Authorization: `Bearer ${token || ""}` },
    body: formData,
  });

  if (!res.ok)
    throw new Error("Failed to upload the product image assets to server.");
  const data = await res.json();

  if (data?.image_url) return [data.image_url];
  if (data?.data?.image_url) return [data.data.image_url];
  if (Array.isArray(data?.image_urls)) return data.image_urls;

  return [];
};

// 🚀 UPLOAD VARIANT-SPECIFIC IMAGE(S) TO PRODUCT VARIANT INTERCEPTOR
export const uploadVariantImage = async (files: FileList) => {
  const token = await getAdminTokenAction();
  const formData = new FormData();

  Array.from(files).forEach((file) => {
    formData.append("image", file);
  });

  const res = await apiFetch("/products/upload-variant-image", {
    method: "POST",
    headers: { Authorization: `Bearer ${token || ""}` },
    body: formData,
  });

  if (!res.ok)
    throw new Error("Failed to upload the variant image assets to server.");
  const data = await res.json();

  if (data?.image_url) return [data.image_url];
  if (data?.data?.image_url) return [data.data.image_url];
  if (Array.isArray(data?.image_urls)) return data.image_urls;
  if (Array.isArray(data?.data?.image_urls)) return data.data.image_urls;

  return [];
};

// 🚀 4. SUBMIT NEW PRODUCT
export const createProduct = async (payload: Record<string, unknown>) => {
  const token = await getAdminTokenAction();
  const res = await apiFetch("/products", {
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
      errorJson?.message || "Failed to finalize product creation.",
    );
  }
  return res.json();
};

// 🚀 5. UPDATE EXISTING PRODUCT (PATCH OPERATION)
export const updateProduct = async (
  id: string,
  payload: Record<string, unknown>,
) => {
  const token = await getAdminTokenAction();
  const res = await apiFetch(`/products/${id}`, {
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
      errorJson?.message || "Failed to finalize product update specifications.",
    );
  }
  return res.json();
};

// 🚀 6. DELETE PRODUCT
export const deleteProduct = async (id: string) => {
  const token = await getAdminTokenAction();
  const res = await apiFetch(`/products/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token || ""}` },
  });
  if (!res.ok) throw new Error("Could not drop target catalog item.");
  return res.json();
};

// update variant
export const updateVariant = async (
  id: string,
  payload: Record<string, unknown>,
) => {
  const token = await getAdminTokenAction();
  const res = await apiFetch(`/products/variants/${id}`, {
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
      errorJson?.message || "Failed to finalize product update specifications.",
    );
  }
  return res.json();
};

// =========== Store Front ============

// 🚀 Filter products for storefront category/brand pages
export interface FilterProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
  min_price?: number;
  max_price?: number;
  category_id?: string;
  brand_id?: string;
  supplier_id?: string;
  sort?: string;
}

export interface FilterProductsResponse {
  data: Product[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    limit: number;
  };
}

export const filterProducts = async (
  query: FilterProductsQuery,
): Promise<FilterProductsResponse> => {
  const queryParams = new URLSearchParams();
  if (query.page) queryParams.set("page", String(query.page));
  if (query.limit) queryParams.set("limit", String(query.limit));
  if (query.search) queryParams.set("search", query.search);
  if (query.min_price !== undefined) {
    queryParams.set("min_price", String(query.min_price));
    queryParams.set("minPrice", String(query.min_price));
  }
  if (query.max_price !== undefined) {
    queryParams.set("max_price", String(query.max_price));
    queryParams.set("maxPrice", String(query.max_price));
  }
  if (query.category_id) queryParams.set("category_id", query.category_id);
  if (query.brand_id) queryParams.set("brand_id", query.brand_id);
  if (query.supplier_id) {
    queryParams.set("supplier_id", query.supplier_id);
    queryParams.set("supplierId", query.supplier_id);
  }
  if (query.sort) queryParams.set("sort", query.sort);

  const res = await apiFetch(`/products?${queryParams.toString()}`, {
    method: "GET",
  });

  if (!res.ok) throw new Error("Failed to fetch filtered products.");

  const json = await res.json();

  // Support multiple response shapes from backend:
  // Shape A: { data: { data: [...], meta: {...} } }
  // Shape B: { data: [...], pagination: {...} }
  // Shape C: { data: [...], meta: {...} }
  const data =
    json?.data?.data || (Array.isArray(json?.data) ? json.data : null) || [];
  const meta = json?.data?.meta || json?.pagination || json?.meta || {};

  return {
    data: Array.isArray(data) ? data : [],
    pagination: {
      current_page: meta.current_page ?? meta.page ?? query.page ?? 1,
      total_pages: meta.total_pages ?? meta.totalPages ?? 1,
      total_items: meta.total_items ?? meta.total ?? 0,
      limit: meta.limit ?? query.limit ?? 16,
    },
  };
};

// search product

export const searchProducts = async (query: string) => {
  if (!query) return [];
  const res = await apiFetch(
    `/products/search?page=1&limit=10&search=${query}`,
    {
      method: "GET",
    },
  );

  if (!res.ok) return [];
  const data = await res.json();
  const productsList =
    data?.data?.data ||
    data?.products ||
    (Array.isArray(data?.data) ? data.data : null) ||
    (Array.isArray(data) ? data : []);
  return productsList;
};

import { getMohasagorProductBySlug } from "./mohasagorService";

// get product by id
export const getProductBySlug = async (
  slug: string,
): Promise<Product | null> => {
  if (!slug) return null;

  if (slug.startsWith("mohasagor-")) {
    return getMohasagorProductBySlug(slug);
  }

  const res = await apiFetch(`/products/${slug}`, {
    method: "GET",
  });

  if (!res.ok) {
    return getMohasagorProductBySlug(slug);
  }
  const result = await res.json();

  return result?.data || null;
};

// related product
export const relatedProduct = async (
  id: string,
  limit: number,
  page: number,
) => {
  if (!id) return null;

  const res = await apiFetch(
    `/products/${id}/related?page=${page}&limit=${limit}`,
    {
      method: "GET",
    },
  );

  if (!res.ok) return null;
  const result = await res.json();

  return result?.data || null;
};

// recent view product api
export const recentViewProduct = async (page: number, limit: number) => {
  const res = await apiFetch(`/products/recent?page=${page}&limit=${limit}`, {
    method: "GET",
  });

  if (!res.ok) return null;
  const result = await res.json();

  return result?.data || null;
};
