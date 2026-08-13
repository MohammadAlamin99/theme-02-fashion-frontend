import { apiFetch } from "@/utils/api";
import { getAdminTokenAction } from "@/app/actions/auth";

// 🚀 1. CREATE NEW SUB CATEGORY (FORCES RELATION PARENT IDS)
export const createSubCategory = async (payload: {
  name: string;
  slug: string;
  parent_id: string; // Mandatory linkage configuration for sub-categories
  description?: string;
  image_url?: string;
  status: "active" | "draft";
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
    throw new Error(errorJson?.message || "Failed to finalize subcategory transactional records.");
  }
  return res.json();
};

// 🚀 2. PRODUCTION READY: UPDATE EXISTING SUB CATEGORY (ENFORCES AND PRESERVES PARENT REALTION)
export const updateSubCategory = async (
  id: string,
  payload: {
    name: string;
    slug: string;
    parent_id: string; // Enforce that parent_id must accompany updates to lock its subcategory status
    description?: string;
    image_url?: string;
    status: "active" | "draft";
  }
) => {
  const token = await getAdminTokenAction();

  // Defensive sanity check: Ensure we are not sending an empty string or null parent_id
  if (!payload.parent_id || payload.parent_id.trim() === "") {
    throw new Error("Data Integrity Error: Cannot update a subcategory without a valid parent category reference.");
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
    throw new Error(errorJson?.message || "Failed to finalize subcategory update execution.");
  }
  return res.json();
};