export interface ShippingConfig {
  zone: string;
  charge: number;
}

export interface ProductTag {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  is_flash_sale: boolean;
}

export interface TagRelation {
  product_id: string;
  tag_id: string;
  tag: ProductTag;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  images: string[];
  attributes: {
    type: string;
    label: string;
    value: string;
  }[];
  stock: number;
  sku: string;
  price: string;
  created_at: string;
  updated_at: string;
}

export interface SpecificationItem {
  type: string;
  desc: string;
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface CampaignDiscountInfo {
  discount_value: number | string;
  campaign_name?: string;
  campaign_id?: string;
  is_free_delivery?: boolean;
}

/**
 * Product card / product listing type
 * Use this when API returns only basic product information.
 */
export interface ProductCard {
  id: string;
  name: string;
  slug: string;
  sell_price: string;
  regular_price: string;
  images: string[] | undefined;
  avg_rating: number;
  total_reviews: number;
  quantity: number;
  discount_tag: string | null;
  campaign_discount?: CampaignDiscountInfo | null;
  final_price?: number | string | null;
}

/**
 * Full product details type
 */
export interface Product {
  id: string;
  name: string;
  slug: string;

  images: string[] | undefined;

  brand?: {
    id: string;
    name: string;
    logo_url?: string;
  };

  suppliers?: {
    id: string;
    name: string;
    image_url?: string;
  }[];

  short_description?: string;
  description?: string;

  video_urls?: string[] | null;

  regular_price: string;
  sell_price: string;

  quantity: number;
  sku?: string;

  unit_name?: string;
  warranty?: string;

  avg_rating: number | string;
  total_reviews: number;

  specifications?: SpecificationItem[] | null;
  faqs?: FAQItem[] | null;

  shipping_config?: ShippingConfig[];

  variants?: ProductVariant[];

  product_tags?: TagRelation[];

  view_count?: number;
  total_sold?: number;

  discount_tag?: string | null;
  shipping_type?: string;

  featuredImage?: string;

  price?: number;

  campaign_discount?: CampaignDiscountInfo | null;
  final_price?: number | string | null;

  // Admin-side fields (returned by backend when fetching a product for editing)
  category_id?: string;
  category?: { id: string; name?: string };
  brand_id?: string;
  tag_ids?: string[];
  tags?: { id: string; name?: string; [key: string]: unknown }[];
  unit_id?: string;
  unit?: { id: string; name?: string };
  modelName?: string;
  cost_price?: number | string | null;
  barcode?: string | null;
  priority?: number | null;
  is_variant_mandatory?: boolean;
  status?: string;
  condition?: string;
  meta_title?: string;
  meta_description?: string;
  meta_tags?: string;
  supplier_ids?: string[];
}

