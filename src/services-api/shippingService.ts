import { apiFetch } from "@/utils/api";
import { CartItem } from "@/@types/order.type";

export interface CourierConfig {
  inside: number;
  outside: number;
  sub_city?: number;
}

export interface ShippingSettingsData {
  id: number;
  default_shipping_fee: string | number;
  courier_config: CourierConfig;
  updated_at?: string;
}

export interface ShippingSettingsResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data: ShippingSettingsData;
}

export interface ProductShippingFields {
  shipping_type?: string;
  shipping_config?: ShippingConfigEntry[] | string;
}

export type CartItemWithShipping = CartItem & {
  isExternal?: boolean;
  shipping_config?: ShippingConfigEntry[] | string;
  product?: ProductShippingFields;
};
// api global settings fetch
export const fetchShippingSettings =
  async (): Promise<ShippingSettingsData | null> => {
    try {
      const res = await apiFetch("/shipping-settings", { method: "GET" });
      if (!res.ok) return null;
      const json = (await res.json()) as ShippingSettingsResponse;
      return json.data || null;
    } catch (error) {
      console.error("Error fetching shipping settings:", error);
      return null;
    }
  };

export interface ShippingConfigEntry {
  zone?: string;
  charge?: number | string;
}

export interface ItemShippingBreakdown {
  cartItemId: string;
  shippingType: string;
  itemShippingFee: number;
}
// calculate cart shipping details
export const calculateCartShippingDetails = (
  cartItems: CartItemWithShipping[],
  shippingArea: string, // "inside" | "outside" | "sub_city"
  shippingSettings?: ShippingSettingsData | null,
): { totalShippingFee: number; itemShippingFees: ItemShippingBreakdown[] } => {
  if (!cartItems || cartItems.length === 0) {
    return { totalShippingFee: 0, itemShippingFees: [] };
  }

  // gobla settings defult value
  const courierConfig = shippingSettings?.courier_config;
  const zoneDefaultFee =
    shippingArea === "inside"
      ? Number(courierConfig?.inside) || 120
      : shippingArea === "sub_city"
        ? Number(courierConfig?.sub_city) || 100
        : Number(courierConfig?.outside) || 150;

  // zone match for database
  const isInside = shippingArea === "inside";
  const isOutside = shippingArea === "outside";
  const isSubCity = shippingArea === "sub_city";

  // cart er item
  const itemShippingFees: ItemShippingBreakdown[] = cartItems.map((item) => {
    // mohasagor / external product
    const isExternal =
      item.productId?.startsWith("mohasagor-") || item.isExternal;

    const prod: ProductShippingFields = item.product || {};
    const sType = String(prod.shipping_type || "DEFAULT").toUpperCase();
    const rawConfig = prod.shipping_config || item.shipping_config;

    let fee = zoneDefaultFee;

    if (isExternal) {
      fee = zoneDefaultFee;
    } else if (sType === "FREE") {
      fee = 0;
    } else if (sType === "CUSTOM" && rawConfig) {
      let parsedConfig: ShippingConfigEntry[] = [];
      try {
        parsedConfig =
          typeof rawConfig === "string" ? JSON.parse(rawConfig) : rawConfig;
      } catch (e) {
        parsedConfig = [];
      }

      // zone match for database
      const match = parsedConfig.find((sc) => {
        const z = String(sc.zone || "")
          .trim()
          .toLowerCase();
        if (
          isInside &&
          (z === "dhaka" || (z.includes("dhaka") && !z.includes("outside")))
        )
          return true;
        if (isOutside && (z.includes("outside") || z !== "dhaka")) return true;
        if (isSubCity && z.includes("sub")) return true;
        return false;
      });

      if (match && match.charge !== undefined && match.charge !== null) {
        fee = Number(match.charge);
      } else {
        fee =
          parsedConfig.length > 0 && parsedConfig[0].charge !== undefined
            ? Number(parsedConfig[0].charge)
            : zoneDefaultFee;
      }
    } else {
      fee = zoneDefaultFee;
    }

    return {
      cartItemId: String(item.id),
      shippingType: sType,
      itemShippingFee: fee,
    };
  });
  //final calculation
  const nonFreeFees = itemShippingFees
    .map((it) => it.itemShippingFee)
    .filter((fee) => fee >= 0);

  const totalShippingFee =
    nonFreeFees.length > 0 ? Math.max(...nonFreeFees) : zoneDefaultFee;

  return {
    totalShippingFee,
    itemShippingFees,
  };
};
