import { apiFetch } from "@/utils/api";

// --- TYPES & INTERFACES ---

export type CampaignStatus = "active" | "inactive" | "draft" | "scheduled";

export interface Campaign {
  id: string;
  name: string;
  slug: string;
  description: string;
  background_image_url: string | null;
  status: CampaignStatus;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  campaign_products: { product_id: string; product?: { images?: string[] } }[];
  is_free_delivery: boolean;
  discount_value: number;
  min_order_amount: number;
  banner_url: string | null;
}

export interface PaginatedResponse<T> {
  data: {
    data: T[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface CampaignQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
}

export interface BannerUploadResponse {
  success: boolean;
  background_image_url: string;
}

// Fields expected during creation
export type CreateCampaignInput = Omit<
  Campaign,
  | "id"
  | "created_at"
  | "updated_at"
  | "campaign_products"
  | "description"
  | "background_image_url"
> & {
  product_ids: string[];
  description?: string;
  background_image_url?: string | null;
};

// Partial for Updates (allows updating only specific fields)
export type UpdateCampaignInput = Partial<CreateCampaignInput>;

// --- API FUNCTIONS ---

/**
 * FETCH ALL CAMPAIGNS (Paginated & Searchable)
 */
export const fetchAllCampaigns = async (
  query: CampaignQueryParams,
): Promise<PaginatedResponse<Campaign>> => {
  const params = new URLSearchParams();
  if (query.page) params.append("page", query.page.toString());
  if (query.limit) params.append("limit", query.limit.toString());
  if (query.search) params.append("search", query.search);

  const res = await apiFetch(`/campaigns?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch campaigns");
  return res.json();
};

/**
 * FETCH SINGLE CAMPAIGN
 */
export const fetchCampaignByIdOrSlug = async (
  idOrSlug: string,
): Promise<Campaign> => {
  const res = await apiFetch(`/campaigns/${idOrSlug}`);
  if (!res.ok) throw new Error("Campaign not found");
  return res.json();
};

/**
 * FETCH ACTIVE CAMPAIGNS
 */
export const fetchActiveCampaigns = async (): Promise<Campaign[]> => {
  const res = await apiFetch(`/campaigns/active`);
  if (!res.ok) throw new Error("Failed to fetch active campaigns");
  return res.json();
};

/**
 * UPLOAD CAMPAIGN BANNER
 */
export const uploadCampaignBanner = async (
  file: File,
): Promise<BannerUploadResponse> => {
  const formData = new FormData();
  formData.append("banner", file);

  const res = await apiFetch("/campaigns/upload-bannner", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Banner upload failed");
  return res.json();
};

/**
 * CREATE CAMPAIGN
 */
export const createCampaign = async (
  data: CreateCampaignInput,
): Promise<Campaign> => {
  const res = await apiFetch("/campaigns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to create campaign");
  }
  return res.json();
};

/**
 * UPDATE CAMPAIGN
 */
export const updateCampaign = async (
  id: string,
  data: UpdateCampaignInput,
): Promise<Campaign> => {
  const res = await apiFetch(`/campaigns/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to update campaign");
  }
  return res.json();
};

/**
 * DELETE CAMPAIGN
 */
export const deleteCampaign = async (id: string): Promise<boolean> => {
  try {
    const res = await apiFetch(`/campaigns/${id}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (error) {
    console.error("Error deleting Campaign:", error);
    return false;
  }
};

// =============store front ========================

export const getActiveCampaign = async () => {
  try {
    const res = await apiFetch(`/campaigns/active`);
    if (!res.ok) throw new Error("Failed to fetch active campaigns");
    return res.json();
  } catch (error) {
    console.error("Error fetching active campaigns:", error);
    return [];
  }
};
