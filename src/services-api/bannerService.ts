import { apiFetch } from "@/utils/api";

export interface Banner {
  id?: string;
  image_url: string[];
  link_url?: string;
  meta_title: string;
  meta_tags?: string;
  meta_description?: string;
  status: "active" | "draft";
  position: number;
}

interface BannerResponse {
  success: boolean;
  data: Banner[];
  statusCode?: number;
}

export const getPublicBanners = async (): Promise<Banner[]> => {
  try {
    const res = await apiFetch("/banners/public", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.warn("Failed to fetch public banners:", res.status);
      return [];
    }

    const result: BannerResponse = await res.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching public banners:", error);
    return [];
  }
};

export const getAdminBanners = async (): Promise<Banner[]> => {
  const res = await apiFetch("/banners/admin-list");
  if (!res.ok) throw new Error("Failed to fetch banners");
  const result = await res.json();
  return result.data || [];
};

export const uploadBulkBanners = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();
  files.forEach((file) => formData.append("banners", file));
  const res = await apiFetch("/banners/upload-bulk", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Upload failed");
  const result = await res.json();
  return result.data.image_urls || [];
};

export const createBanner = async (data: Banner): Promise<void> => {
  const res = await apiFetch("/banners", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to create banner");
  }
};

export const updateBanner = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<Banner>;
}): Promise<void> => {
  const res = await apiFetch(`/banners/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Update failed");
};


export const deleteBanner = async (id: string): Promise<void> => {
  const res = await apiFetch(`/banners/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete banner");
};