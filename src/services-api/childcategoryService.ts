import { apiFetch } from "@/utils/api";
import { getAdminTokenAction } from "@/app/actions/auth";

export interface CategoryQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface ChildCategoryItem {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  status: string;
  priority?: number;
  description?: string | null;
  meta_title?: string | null;
  meta_tags?: string | null;
  meta_description?: string | null;
  parent?: {
    id: string;
    name: string;
    parent_id?: string | null;
    parent?: {
      id?: string;
      name?: string;
      parent_id?: string | null;
    };
  } | null;
  _count?: {
    products: number;
  };
  created_at?: string;
  updated_at?: string;
}

// 🚀 1. FETCH ONLY TRUE LEVEL-3 CHILD CATEGORIES
export const fetchAllChildCategories = async (query: CategoryQuery) => {
  const queryParams = new URLSearchParams();
  queryParams.set("limit", "1000"); // Fetch all categories to properly filter level-3 child nodes
  if (query.search) queryParams.set("search", query.search);
  if (query.status) queryParams.set("status", query.status);

  const res = await apiFetch(`/categories?${queryParams.toString()}`);
  if (!res.ok)
    throw new Error("Failed to retrieve child categories collection layout.");
  const json = await res.json();
  const rawRecords: ChildCategoryItem[] =
    json?.data?.data || json?.data || (Array.isArray(json) ? json : []);

  if (!Array.isArray(rawRecords)) {
    return {
      data: [],
      meta: { total: 0, totalPages: 1, page: query.page || 1, limit: query.limit || 10 },
    };
  }

  // Create lookup map for category relationships
  const categoryMap = new Map<string, ChildCategoryItem>();
  rawRecords.forEach((cat) => {
    categoryMap.set(cat.id, cat);
  });

  // Strict structural filtering: Level 3 child categories have a parent_id,
  // and their parent has a parent_id (pointing to a root category)
  const childRecords = rawRecords
    .filter((item) => {
      if (!item.parent_id) return false;

      const parent = item.parent || categoryMap.get(item.parent_id);
      if (!parent) return false;

      const grandParentId = parent.parent_id || parent.parent?.parent_id;
      return !!grandParentId;
    })
    .map((item) => {
      const parent = item.parent || categoryMap.get(item.parent_id!);
      return {
        ...item,
        parent: parent
          ? {
              id: parent.id,
              name: parent.name,
              parent_id: parent.parent_id,
            }
          : item.parent,
      };
    });

  const page = query.page || 1;
  const limit = query.limit || 10;
  const total = childRecords.length;
  const totalPages = Math.ceil(total / limit) || 1;

  const paginatedData = childRecords.slice((page - 1) * limit, page * limit);

  return {
    data: paginatedData,
    meta: { total, totalPages, page, limit },
  };
};

// 🚀 2. STRICT FILTER: FETCH ONLY GENUINE LEVEL-2 SUB-CATEGORIES FOR DROPDOWN
export const fetchSubCategoriesOnly = async (): Promise<ChildCategoryItem[]> => {
  const res = await apiFetch("/categories?limit=1000");
  if (!res.ok)
    throw new Error("Failed to sync sub-category dependency mappings.");
  const json = await res.json();
  const rawRecords: ChildCategoryItem[] =
    json?.data?.data || json?.data || (Array.isArray(json) ? json : []);

  if (!Array.isArray(rawRecords)) return [];

  const categoryMap = new Map<string, ChildCategoryItem>();
  rawRecords.forEach((cat) => categoryMap.set(cat.id, cat));

  // Subcategories have a parent_id, but their parent has NO parent_id (it's root)
  return rawRecords.filter((item) => {
    if (!item.parent_id) return false;
    const parent = item.parent || categoryMap.get(item.parent_id);
    if (!parent) return true;
    return !parent.parent_id && !parent.parent?.parent_id;
  });
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
