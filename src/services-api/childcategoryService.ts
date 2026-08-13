import { apiFetch } from "@/utils/api";
import { getAdminTokenAction } from "@/app/actions/auth";

export interface CategoryQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

// 🚀 1. FETCH ONLY TRUE LEVEL-3 CHILD CATEGORIES
export const fetchAllChildCategories = async (query: CategoryQuery) => {
  const queryParams = new URLSearchParams();
  if (query.page) queryParams.set("page", String(query.page));
  if (query.limit) queryParams.set("limit", String(query.limit));
  if (query.search) queryParams.set("search", query.search);
  if (query.status) queryParams.set("status", query.status);

  // We bring the list with a deep nested tree parse configuration
  const res = await apiFetch(`/categories?${queryParams.toString()}`);
  if (!res.ok)
    throw new Error("Failed to retrieve child categories collection layout.");
  const json = await res.json();
  const rawRecords = json?.data?.data || json?.data || json || [];

  // Strict structural filtering: A child category has a parent that ALSO has a parent
  const childRecords = Array.isArray(rawRecords)
    ? rawRecords.filter(
        (item: unknown) =>
          (item as { parent_id: string })?.parent_id !== null &&
          (item as { parent: { parent_id: string } })?.parent?.parent_id !==
            null &&
          (item as { parent: { parent_id: string } })?.parent?.parent_id !==
            undefined,
      )
    : [];

  const meta = json?.data?.meta || json?.meta || { totalPages: 1, total: 0 };
  return { data: childRecords, meta };
};

// 🚀 2. STRICT FILTER: FETCH ONLY GENUINE LEVEL-2 SUB-CATEGORIES FOR DROPDOWN
export const fetchSubCategoriesOnly = async () => {
  const res = await apiFetch("/categories?limit=1000");
  if (!res.ok)
    throw new Error("Failed to sync sub-category dependency mappings.");
  const json = await res.json();
  const rawRecords = json?.data?.data || json?.data || json || [];

  // Subcategories have a parent_id, but their parent has NO parent_id (it's root)
  return Array.isArray(rawRecords)
    ? rawRecords.filter(
        (item: unknown) =>
          (item as { parent_id: string })?.parent_id !== null &&
          (item as { parent_id: string })?.parent_id !== undefined &&
          !(item as { parent: { parent_id: string } })?.parent?.parent_id,
      )
    : [];
};

// 🚀 3. CREATE NEW CHILD CATEGORY
export const createChildCategory = async (payload: {
  name: string;
  slug: string;
  parent_id: string; // Must point to a level-2 Sub Category ID
  description?: string;
  status: "active" | "draft";
  priority?: number;
  meta_title?: string;
  meta_tags?: string;
  meta_description?: string;
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
      errorJson?.message || "Failed to finalize child category records.",
    );
  }
  return res.json();
};

// 🚀 ADD THIS TO src/services/childcategoryService.ts

export const updateChildCategory = async (
  id: string,
  payload: {
    name: string;
    slug: string;
    parent_id: string; // Enforces parent_id selection so it never unlinks into a root category
    description?: string;
    status: "active" | "draft";
    priority?: number;
    meta_title?: string;
    meta_tags?: string;
    meta_description?: string;
  },
) => {
  const token = await getAdminTokenAction();

  if (!payload.parent_id || payload.parent_id.trim() === "") {
    throw new Error(
      "Data Integrity Error: Cannot separate a child category from its parent sub-category link.",
    );
  }

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
      errorJson?.message || "Failed to execute child category record update.",
    );
  }
  return res.json();
};
