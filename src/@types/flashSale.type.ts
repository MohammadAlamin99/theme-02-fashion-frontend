export interface FlashSaleProduct {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  old_price: number;
  discount_tag?: string | null;
  rating?: string;
  review_count?: number;
  stock_status?: string;
  quantity_left: number;
}

export interface FlashSaleData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  meta_title: string;
  meta_tags: string;
  meta_description: string;
  banner_url: string;
  is_flash_sale: boolean;
  end_date: string;
  products: FlashSaleProduct[];
}
