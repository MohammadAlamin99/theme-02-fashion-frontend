
export interface Campaign {
  id: string;
  name: string;
  slug: string;
  start_date: string;
  end_date: string | null;
  discount_value: number;
  min_order_amount: number;
  is_free_delivery: boolean;
  banner_url: string | null;
  status: "active" | "inactive";
  campaign_products?: { product_id: string }[];
}

export type CreateCampaignInput = Omit<Campaign, "id">;
export type UpdateCampaignInput = Partial<CreateCampaignInput>;
