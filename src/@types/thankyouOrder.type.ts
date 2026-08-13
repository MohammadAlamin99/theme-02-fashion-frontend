export interface ThankYouOrder {
  id: string;
  user_id: string;
  order_number: string;
  source: string;
  status: string;
  is_on_hold: boolean;

  total_product_cost: string;
  discount_amount: string;
  shipping_fee: string;
  total_amount_due: string;
  profit_amount: string;
  total_weight: string;

  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_note: string | null;

  payment_method: string;
  payment_status: string;

  courier_name: string | null;
  tracking_code: string | null;
  courier_city_id: string | null;
  courier_zone_id: string | null;
  courier_area_id: string | null;
  courier_status: string | null;

  couponId: string | null;
  coupon: null;

  order_comment: string | null;
  invoice_number: string;
  invoice_date: string | null;
  notes: string | null;

  created_at: string;
  updated_at: string;

  order_items: ThankYouOrderItem[];
}

export interface ThankYouOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;

  product_name: string;
  quantity: number;
  unit_price: string;
  unit_cost: string;
  item_shipping_fee: string;
  external_image?: string;
  externalImage?: string;
  external_variant_info?: string;
  externalVariantInfo?: string;

  product: {
    name: string;
    sku: string;
    images: string[];
  };

  variant?: {
    name: string;
    color: string;
    size: string;
    images: string[];
    attributes?: variantAttributes;
  };
}
export interface variantAttributes {
  [key: string]: string;
}

export interface ThankYouVariant {
  id: string;
  name?: string;
  sku?: string;
  image?: string;
  price?: string;
}


