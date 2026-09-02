import { apiFetch } from "@/utils/api";

export interface PopupBanner {
  id: string;
  image_url: string;
  link_url?: string;
  show_once: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const fetchPopupBanners = async (): Promise<PopupBanner[]> => {
  const res = await apiFetch("/popup-banner");
  if (!res.ok) throw new Error("Failed to fetch popup banners");
  const result = await res.json();
  const data = result?.data?.data || result?.data || result || [];
  return Array.isArray(data) ? data : [];
};

export const getActivePopupBanner = async (): Promise<PopupBanner | null> => {
  try {
    const res = await apiFetch("/popup-banner/active");
    if (!res.ok) return null;
    const result = await res.json();
    // Handle both nested and flat response shapes
    const banner = result?.data?.data || result?.data || result || null;
    return banner && typeof banner === "object" && banner.id ? banner : null;
  } catch (error) {
    console.error("getActivePopupBanner error:", error);
    return null;
  }
};

export const uploadPopupImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);
  
  const res = await apiFetch("/popup-banner/upload-image", {
    method: "POST",
    body: formData,
  });
  
  if (!res.ok) throw new Error("Upload failed");
  const result = await res.json();
  const imageUrl = result?.data?.image_url || result?.image_url;
  
  if (!imageUrl) {
    throw new Error("Failed to extract image URL from upload response");
  }
  
  return imageUrl;
};

export const createPopupBanner = async (data: Partial<PopupBanner>): Promise<PopupBanner> => {
  const res = await apiFetch("/popup-banner", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to create popup banner");
  }
  return res.json();
};

export const updatePopupBanner = async (id: string, data: Partial<PopupBanner>): Promise<PopupBanner> => {
  const res = await apiFetch(`/popup-banner/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
};

export const deletePopupBanner = async (id: string): Promise<void> => {
  const res = await apiFetch(`/popup-banner/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete popup banner");
};
