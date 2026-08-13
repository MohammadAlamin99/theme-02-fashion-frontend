import { apiFetch } from "@/utils/api";

// ---------- Types (matching actual backend payload) ----------

export interface OrderProductInfo {
  name?: string;
  images?: string[];
  sku?: string;
}

export interface OrderVariantInfo {
  id?: string;
  name?: string;
  sku?: string;
}

export interface TrackedOrderItem {
  id: string;
  order_id?: string;
  product_id?: string;
  variant_id?: string | null;
  product_name: string;
  quantity: number;
  unit_price?: string;
  unit_cost?: string;
  item_shipping_fee?: string;
  external_product_id?: string | null;
  external_variant_id?: string | null;
  external_image?: string | null;
  external_attributes?: Record<string, unknown> | null;
  product?: OrderProductInfo;
  variant?: OrderVariantInfo | null;
}

export interface OrderCoupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: string;
  minOrderValue?: string;
  maxDiscount?: string;
  usageLimit?: number;
  usedCount?: number;
  expiresAt?: string;
  isActive?: boolean;
}

export interface TrackedOrderTimeline {
  status: string;
  label?: string;
  date: string;
  desc?: string;
}

export interface TrackedOrderResponse {
  id: string;
  user_id?: string;
  order_number: string;
  source?: string;
  status: string;
  is_on_hold?: boolean;
  total_product_cost?: string;
  discount_amount?: string;
  shipping_fee?: string;
  total_amount_due?: string;
  profit_amount?: string;
  advance_amount?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_note?: string;
  couponId?: string | null;
  payment_method?: string;
  payment_status?: string;
  courier_name?: string | null;
  tracking_code?: string | null;
  order_comment?: string | null;
  invoice_number?: string;
  invoice_date?: string | null;
  notes?: string | null;
  courier_city_id?: string | null;
  courier_zone_id?: string | null;
  courier_area_id?: string | null;
  courier_status?: string | null;
  total_weight?: string;
  created_at: string;
  updated_at: string;
  order_items?: TrackedOrderItem[];
  coupon?: OrderCoupon | null;
  total_bill?: number;
  advanceAmount?: string;
  totalDue?: string;
  timeline?: TrackedOrderTimeline[];
}

interface ApiEnvelope<T> {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: T;
  timestamp?: string;
}

interface OrdersListPayload {
  data: TrackedOrderResponse[];
  meta?: Record<string, unknown>;
}

interface ApiErrorBody {
  message?: string;
}

// ---------- Helpers ----------

const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/** Normalizes user input into the canonical "ORD-<digits>" form used by the DB. */
function normalizeOrderNumber(raw: string): {
  full: string; // e.g. "ORD-1786178764113"
  digitsOnly: string; // e.g. "1786178764113"
} {
  const trimmed = raw.trim().replace(/^#/, "").trim();
  const digitsOnly = trimmed.replace(/^ORD-/i, "").trim();
  const full = `ORD-${digitsOnly}`;
  return { full, digitsOnly };
}

function friendlyErrorMessage(body: ApiErrorBody | undefined): string {
  const msg = body?.message;
  if (!msg || msg === "Database error occurred") {
    return "Order not found. Please verify your Order ID.";
  }
  return msg;
}

// ---------- Main service ----------

export const trackOrderService = async (
  orderId: string,
): Promise<TrackedOrderResponse> => {
  const cleaned = orderId.trim().replace(/^#/, "").trim();

  if (!cleaned) {
    throw new Error("Please enter a valid Order ID");
  }

  // 1) UUID (internal order id) — fetch directly
  if (UUID_REGEX.test(cleaned)) {
    const res = await apiFetch(`/orders/${encodeURIComponent(cleaned)}`, {
      method: "GET",
    });
    const body = (await res.json()) as ApiEnvelope<TrackedOrderResponse>;
    if (!res.ok) {
      throw new Error(friendlyErrorMessage(body as ApiErrorBody));
    }
    if (!body.data) {
      throw new Error("Order not found. Please verify your Order ID.");
    }
    return body.data;
  }

  const { full, digitsOnly } = normalizeOrderNumber(cleaned);

  // 2) Search by order_number via /orders/my-orders?search=ORD-xxxx
  try {
    const searchRes = await apiFetch(
      `/orders/my-orders?search=${encodeURIComponent(full)}`,
      { method: "GET" },
    );
    if (searchRes.ok) {
      const body = (await searchRes.json()) as ApiEnvelope<OrdersListPayload>;
      const ordersList: TrackedOrderResponse[] = body.data?.data ?? [];

      if (ordersList.length > 0) {
        const exactMatch = ordersList.find(
          (o) => o.order_number?.trim().toUpperCase() === full.toUpperCase(),
        );
        return exactMatch ?? ordersList[0];
      }
    }
  } catch {
    // fall through to next strategy
  }

  // 3) Public track-by-order-number endpoint
  try {
    const trackRes = await apiFetch(
      `/orders/track/${encodeURIComponent(full)}`,
      { method: "GET" },
    );
    if (trackRes.ok) {
      const body = (await trackRes.json()) as ApiEnvelope<TrackedOrderResponse>;
      if (body.data) return body.data;
    }
  } catch {
    // fall through
  }

  // 4) Last resort: try the raw digits-only value as a path id (kept for safety)
  const fallbackRes = await apiFetch(
    `/orders/${encodeURIComponent(digitsOnly)}`,
    { method: "GET" },
  );
  const fallbackBody =
    (await fallbackRes.json()) as ApiEnvelope<TrackedOrderResponse>;

  if (!fallbackRes.ok || !fallbackBody.data) {
    throw new Error(friendlyErrorMessage(fallbackBody as ApiErrorBody));
  }

  return fallbackBody.data;
};
