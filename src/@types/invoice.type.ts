export interface invoiceItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: string;
  unit_cost: string;
  item_shipping_fee: string;
  external_product_id: string | null;
  external_variant_id: string | null;
  external_image: string | null;
  external_attributes: string;
  product: {
    name: string;
    images: string[];
    sku: string;
    unit: string;
    attributes: unknown;
  } | null;
  variant: {
    images: string[];
    sku: string;
    unit: string;
    attributes: unknown;
  } | null;
}
