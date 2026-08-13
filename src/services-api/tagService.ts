import { apiFetch } from "@/utils/api";
import { getAdminTokenAction } from "@/app/actions/auth";

export interface TagQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

// 🚀 1. FETCH ALL TAGS PAGINATED
export const fetchAllTags = async (query: TagQuery) => {
  const queryParams = new URLSearchParams();
  if (query.page) queryParams.set("page", String(query.page));
  if (query.limit) queryParams.set("limit", String(query.limit));
  if (query.search) queryParams.set("search", query.search);
  if (query.status) queryParams.set("status", query.status);

  const res = await apiFetch(`/tags?${queryParams.toString()}`);
  if (!res.ok) throw new Error("Failed to retrieve tags dataset allocation.");

  const json = await res.json();
  const records = json?.data?.data || json?.data || json || [];
  const meta = json?.data?.meta || json?.meta || { totalPages: 1, total: 0 };

  return { data: Array.isArray(records) ? records : [], meta };
};

// 🚀 2. FETCH SINGLE TAG BY ID
export const fetchSingleTag = async (id: string) => {
  const res = await apiFetch(`/tags/${id}`);
  if (!res.ok) throw new Error("Could not load tag entity details.");
  const json = await res.json();
  return json?.data || json;
};

// 🚀 3. DELETE SINGLE TAG
export const deleteTag = async (id: string) => {
  const token = await getAdminTokenAction();
  const res = await apiFetch(`/tags/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token || ""}` },
  });
  if (!res.ok) throw new Error("Failed to delete selected tag record.");
  return res.json();
};

// 🚀 4. UPLOAD MEDIA ASSETS (FIXED ROUTING PATHWAY TO THE VALID CONTROLLER MAPPING)
export const uploadTagMedia = async (file: File) => {
  const token = await getAdminTokenAction();
  const formData = new FormData();
  formData.append("image", file);

  // 🚀 FIXED: Pointed directly to the generic category file interceptor matrix endpoint
  const res = await apiFetch("/categories/upload-image", {
    method: "POST",
    headers: { Authorization: `Bearer ${token || ""}` },
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to upload graphic asset.");
  const data = await res.json();
  return data?.image_url || data?.data?.image_url || "";
};

// 🚀 5. CREATE NEW TAG
export const createTag = async (payload: Record<string, unknown>) => {
  const token = await getAdminTokenAction();
  const res = await apiFetch("/tags", {
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
      errorJson?.message || "Failed to finalize tag record creation.",
    );
  }
  return res.json();
};

// 🚀 6. UPDATE EXISTING TAG RECORD
export const updateTag = async (
  id: string,
  payload: Record<string, unknown>,
) => {
  const token = await getAdminTokenAction();
  const res = await apiFetch(`/tags/${id}`, {
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
      errorJson?.message || "Failed to finalize tag record modifications.",
    );
  }
  return res.json();
};

// ================= store front ===========================

//  get home page tags products

export interface HomeProduct {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  old_price: number;
  discount_tag: string | null;
  rating: string;
  review_count: number;
  stock_status: string;
  quantity_left: number;
}

export interface HomeTagSection {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  meta_title: string;
  meta_tags: string;
  meta_description: string;
  banner_url: string;
  is_flash_sale: boolean;
  start_date: string | null;
  end_date: string;
  products: HomeProduct[];
}

export const getHomeTags = async (): Promise<HomeTagSection[]> => {
  try {
    const response = await apiFetch(`tags/home`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 600 },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error("Fetch Error (getHomeTags):", error instanceof Error ? error.message : "Unknown error");
    throw error;
  }
};

// // flash sales tag
// export interface Tag {
//   id: string;
//   name: string;
//   slug: string;
//   is_flash_sale: boolean;
//   start_date: string | null;
//   end_date: string | null;
//   display_order: number;
//   image_url?: string;
//   banner_url?: string;
//   products?: any[];
// }

// export const getFlashHomeTags = async (): Promise<Tag[]> => {
//   try {
//     const response = await apiFetch(`/tags/home`, {
//       cache: "no-store",
//     });

//     if (!response.ok) return [];
//     const result = await response.json();
//     return result.data || result;
//   } catch (error) {
//     console.error("Error fetching tags:", error);
//     return [];
//   }
// };
