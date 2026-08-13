
import { apiFetch } from "@/utils/api";
import { getAdminTokenAction } from "@/app/actions/auth";

export interface OrderItemInput {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface ExternalOrderItemInput {
  isExternal: true;
  externalProductId: string;
  externalName: string;
  externalPrice: number;
  externalImage?: string;
  external_image?: string;
  externalVariantInfo?: string;
  external_variant_info?: string;
  quantity: number;
}

export type CreateOrderItems = OrderItemInput | ExternalOrderItemInput;

export interface CreateOrderRequest {
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerNote?: string;
  customer_note?: string;
  paymentMethod: "COD" | "ONLINE" | string;
  shippingArea: "inside" | "outside" | string;
  couponCode?: string;
  source?: string;
  items: CreateOrderItems[];
}

// 🚀 FIXED: Added full update payload interface
export interface UpdateOrderRequest {
  status?: string;
  paymentStatus?: string;
  manualDiscount?: number;
  advanceAmount?: number;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerNote?: string;
  shippingArea?: string;
  items?: OrderItemInput[]; // For full order item editing
  courierName?: string;
  trackingCode?: string;
  courier_city_id?: number;
  courier_zone_id?: number;
  courier_area_id?: number;
}

export interface UpdateInvoicePayload {
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerNote?: string;
}

export interface OrderQuery {
  page?: number | string;
  limit?: number | string;
  search?: string;
  status?: string;
  payment_status?: string;
  source?: string;
  startDate?: string;
  endDate?: string;
  refresh?: boolean;
}

// 🚀 1. Create order (Added Auth Token)
export const createOrderService = async (orderData: CreateOrderRequest) => {
  try {
    const token = await getAdminTokenAction();
    const response = await apiFetch("/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || ""}`,
      },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Order Failed !");
    }
    return result;
  } catch (error) {
    console.error("Order Creation Error:", error);
    throw error;
  }
};

// 🚀 2. Get order for invoice/edit
export const getOrderByIdService = async (id: string) => {
  try {
    const response = await apiFetch(`/orders/${id}`, {
      method: "GET",
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch order details");
    }
    return result.data || result;
  } catch (error) {
    console.error("Fetch Order Error:", error);
    throw error;
  }
};

// 🚀 3. Edit order invoice service
export const editOrderInvoiceService = async (
  id: string,
  invoiceData: UpdateInvoicePayload,
) => {
  try {
    const response = await apiFetch(`/orders/${id}/invoice-edit`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoiceData),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to update invoice");
    }
    return result.data || result;
  } catch (error) {
    console.error("Edit Invoice Error:", error);
    throw error;
  }
};

// 🚀 3. Update Full Order / Status (Admin Action)
export const updateOrderStatusService = async (
  id: string,
  updateData: UpdateOrderRequest,
) => {
  try {
    const token = await getAdminTokenAction();
    const response = await apiFetch(`/orders/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || ""}`,
      },
      body: JSON.stringify(updateData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to update order");
    }
    return result;
  } catch (error: unknown) {
    console.error("Update Order Error:", error);
    if (error instanceof Error) {
      throw error.message || error || "An unexpected error occurred";
    }
    throw "An unexpected error occurred";
  }
};

// 🚀 4. Get All Orders (Admin View) with Cache Busting
export const getAllOrdersService = async (query: OrderQuery) => {
  try {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        key !== "refresh"
      ) {
        params.append(key, String(value));
      }
    });

    // ⚡ Busts the Backend Redis Cache
    if (query.refresh) {
      params.append("t", Date.now().toString());
    }

    const response = await apiFetch(`/orders?${params.toString()}`, {
      method: "GET",
    });

    const result = await response.json();
    if (!response.ok)
      throw new Error(result.message || "Failed to fetch orders");
    return result;
  } catch (error: unknown) {
    console.error("Fetch All Orders Error:", error);
    throw error;
  }
};

// 🚀 5. My orders (Customer View)
export const getMyOrdersService = async (query: OrderQuery) => {
  try {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });

    const response = await apiFetch(`/orders/my-orders?${params.toString()}`, {
      method: "GET",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch my orders");
    }
    return result;
  } catch (error: unknown) {
    console.error("Fetch My Orders Error:", error);
    throw error;
  }
};

// 🚀 6. Search Products for adding/editing order
export const searchProductsService = async (query: string) => {
  const res = await apiFetch(`/products?search=${query}&limit=10`, {
    method: "GET",
  });
  return res.json();
};

// 🚀 7. Fetch Order Tab Counts (Used for Initial Load)
export const fetchOrderCounts = async (tabs: string[]) => {
  const promises = tabs.map(async (tab) => {
    const status = tab === "All order" ? "" : tab.toUpperCase();
    const res = await getAllOrdersService({
      page: 1,
      limit: 1,
      status,
      refresh: true,
    });
    return { tab, count: res.data?.meta?.total || 0 };
  });
  return Promise.all(promises);
};

