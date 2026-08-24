type FraudStatus = "Safe" | "Risky" | "Mediam";

export interface Order {
  // Existing fields
  id: number | string; // Updated to support UUID string format from JSON
  orderId: string;
  product: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  price: string;
  payment: string;
  fraudStatus: FraudStatus;
  fraudScore: number;
  status: string;
  order_items: Array<{
    product: {
      name: string;
      images?: string[];
    };
  }>;
  order_number: string;
  total_amount_due: string;
  payment_status: string;
  created_at: string;
  cart_items: CartItem[];

  // Added fields based on JSON data
  invoiceNo: string;
  deliveryFee: number;
  discountAmount: number;
  totalAmountDue: number; // Numeric version (JSON has 681, while total_amount_due is string)
  customer: Customer;
  items: OrderItem[];
  customerNote?: string;
  customer_image?: string;
  customer_name?: string;
  customer_phone?: string;
}

export interface TableColumn<T = unknown> {
  header: string;
  key: string;
  className?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

export interface CartItemProduct {
  id: string;
  name: string;
  featuredImage: string;
  images?: string[];
  price: number;
  discountPrice?: number;
  shipping_type?: "DEFAULT" | "CUSTOM" | "FREE" | string;
  shipping_config?: Array<{ zone: string; charge: number }> | string;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  name?: string;
  price?: number | string;
  image?: string | null;
  sell_price?: number | string;
  cart_items?: CartItem[];
  order_items?: OrderItem[];

  variantInfo?:
    | Array<{ label?: string; value?: string; type?: string }>
    | Record<string, unknown>;

  product?: CartItemProduct;

  // Added because checkout uses item.shipping_config
  shipping_config?: Array<{ zone: string; charge: number }> | string;

  variant?: {
    id: string;
    name?: string;
    color?: string;
    size?: string;
    images?: string[];
    price?: number | string;
    sell_price?: number | string;
  };
}

export interface OrderPayload {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNote?: string;
  customer_note?: string;
  paymentMethod: string;

  // Fixed: shippingArea is a single shipping zone, not an array
  shippingArea: "inside" | "outside" | "sub_city";

  shippingFee?: number;
  shipping_fee?: number;
  delivery_charge?: number;

  couponCode?: string;
  source?: string;

  items: (
    | {
        productId: string;
        variantId?: string;
        quantity: number;
        item_shipping_fee?: number;
        isExternal?: never;
      }
    | {
        isExternal: true;
        externalProductId: string;
        externalVariantId?: string | null;
        externalName: string;
        externalPrice: number;
        externalImage?: string;
        externalAttributes?: Array<{
          type: string;
          label: string;
          value: string;
        }>;
        item_shipping_fee?: number;
        quantity: number;
        productId?: never;
        variantId?: never;
      }
  )[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  profile?: {
    image?: string;
    avatar?: string;
  };
  image?: string;
  avatar?: string;
}

export interface OrderItem {
  id: string;
  productId?: string;
  variantId?: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  variantInfo: string;
  unit_price: number;
  item_shipping_fee: number;
}
