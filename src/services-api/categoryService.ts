import { apiFetch } from "@/utils/api";
import { getAdminTokenAction } from "@/app/actions/auth";

export interface CategoryQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const fetchAllCategories = async (query: CategoryQuery) => {
  const queryParams = new URLSearchParams();
  queryParams.set("limit", "1000"); // Fetch all to filter and paginate on frontend
  if (query.search) queryParams.set("search", query.search);
  if (query.status) queryParams.set("status", query.status);

  const res = await apiFetch(`/categories?${queryParams.toString()}`);
  if (!res.ok)
    throw new Error("Failed to retrieve categories collection array");
  const json = await res.json();
  const records = json?.data?.data || json?.data || json || [];

  const rootCategories = Array.isArray(records)
    ? records.filter(
        (item: { parent_id?: string | null }) =>
          item.parent_id === null || item.parent_id === undefined,
      )
    : [];

  const page = query.page || 1;
  const limit = query.limit || 10;
  const total = rootCategories.length;
  const totalPages = Math.ceil(total / limit) || 1;

  const paginatedData = rootCategories.slice((page - 1) * limit, page * limit);

  return {
    data: paginatedData,
    meta: { total, totalPages, page, limit },
  };
};

export const fetchAllSubCategories = async (query: CategoryQuery) => {
  const queryParams = new URLSearchParams();
  queryParams.set("limit", "1000"); // Fetch all to filter and paginate on frontend
  if (query.search) queryParams.set("search", query.search);
  if (query.status) queryParams.set("status", query.status);

  const res = await apiFetch(`/categories?${queryParams.toString()}`);
  if (!res.ok)
    throw new Error(
      "Failed to retrieve subcategories collection layout array.",
    );
  const json = await res.json();
  const rawRecords = json?.data?.data || json?.data || json || [];

  const subCategoryRecords = Array.isArray(rawRecords)
    ? rawRecords.filter(
        (item: { parent_id?: string | null }) =>
          item.parent_id !== null && item.parent_id !== undefined,
      )
    : [];

  const page = query.page || 1;
  const limit = query.limit || 10;
  const total = subCategoryRecords.length;
  const totalPages = Math.ceil(total / limit) || 1;

  const paginatedData = subCategoryRecords.slice(
    (page - 1) * limit,
    page * limit,
  );

  return {
    data: paginatedData,
    meta: { total, totalPages, page, limit },
  };
};

// 🚀 3. STRICT FIX: FETCH ONLY TRUE ROOT PARENT NODES
export const fetchRootCategoriesOnly = async () => {
  const res = await apiFetch("/categories?limit=1000");
  if (!res.ok) throw new Error("Failed to sync root nodes.");
  const json = await res.json();
  const rawRecords = json?.data?.data || json?.data || json || [];
  return Array.isArray(rawRecords)
    ? rawRecords.filter(
        (item: { parent_id?: string | null }) =>
          item.parent_id === null || item.parent_id === undefined,
      )
    : [];
};

// 🚀 4. FETCH SINGLE CATEGORY RECORD FOR EDIT PRE-POPULATION
export const fetchSingleCategory = async (id: string) => {
  const res = await apiFetch(`/categories/${id}`);
  if (!res.ok)
    throw new Error("Could not fetch the specified category details.");
  const json = await res.json();
  return json?.data || json;
};

// 🚀 5. DELETE SINGLE CATEGORY
export const deleteCategory = async (id: string) => {
  const token = await getAdminTokenAction();
  const res = await apiFetch(`/categories/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token || ""}` },
  });
  if (!res.ok) throw new Error("Failed to delete category");
  return res.json();
};

// 🚀 6. UPLOAD CATEGORY GRAPHIC TO STORAGE ENDPOINT
export const uploadCategoryImage = async (file: File) => {
  const token = await getAdminTokenAction();
  const formData = new FormData();
  formData.append("image", file);
  const res = await apiFetch("/categories/upload-image", {
    method: "POST",
    headers: { Authorization: `Bearer ${token || ""}` },
    body: formData,
  });
  if (!res.ok)
    throw new Error("Failed to process graphic file asset stream upload.");
  return res.json();
};

// 🚀 7. CREATE CATEGORY TRANSACTION
export const createCategory = async (payload: {
  name: string;
  slug: string;
  parent_id?: string | null;
  image_url?: string | null;
  description?: string | null;
  background_image_url?: string | null;
  priority?: number;
  status?: string;
}) => {
  const token = await getAdminTokenAction();
  const res = await apiFetch("/categories", {
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
      errorJson?.message || "Failed to finalize category creation.",
    );
  }
  return res.json();
};

// 🚀 8. UPDATE SINGLE CATEGORY RECORD (PATCH ROW)
export const updateCategory = async (
  id: string,
  payload: {
    name: string;
    slug: string;
    parent_id?: string | null;
    image_url?: string | null;
    description?: string | null;
    background_image_url?: string | null;
    priority?: number;
    status: string;
  },
) => {
  const token = await getAdminTokenAction();
  const res = await apiFetch(`/categories/${id}`, {
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
      errorJson?.message || "Failed to finalize category update execution.",
    );
  }
  return res.json();
};

// Store Front Service

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  image_url?: string | null;
  children?: Category[];
  image?: File;
  created_at?: string;
  updated_at?: string;
  _count?: { products: number };
  status?: string;
  sl?: number;
}

export interface CategoryDetail extends Category {
  description?: string | null;
  background_image_url?: string | null;
  children?: CategoryDetail[];
  _count?: { products: number };
  meta_title?: string | null;
  meta_description?: string | null;
  meta_tags?: string | null;
}

export const getCategory = async (slug: string): Promise<CategoryDetail> => {
  const res = await apiFetch(`/categories/${slug}`);
  if (!res.ok) throw new Error("Failed to fetch category");
  const result = await res.json();
  return result?.data || result;
};

// Flat list of all categories for filter sidebar
export const getAllcategoryFlatList = async (): Promise<{
  data: Category[];
}> => {
  const res = await apiFetch("/categories?limit=200&status=active");
  if (!res.ok) throw new Error("Failed to fetch category list");
  const json = await res.json();
  const records = json?.data?.data || json?.data || json || [];
  return { data: Array.isArray(records) ? records : [] };
};

export const getCategoryTree = async (): Promise<Category[]> => {
  const res = await apiFetch("/categories/tree?page=1&limit=30");
  if (!res.ok) throw new Error("Failed to fetch categories");
  const result = await res.json();
  const data = result?.data?.data || result?.data || result || [];
  return Array.isArray(data) ? data : [];
};
