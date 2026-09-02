// import { apiFetch } from "@/utils/api";
// import { CartItem } from "@/@types/order.type";
// import Cookies from 'js-cookie';

// export interface CourierConfig {
//   inside: number;
//   outside: number;
//   sub_city?: number;
// }

// export interface ShippingSettingsData {
//   id: number;
//   default_shipping_fee: string | number;
//   courier_config: CourierConfig;
//   updated_at?: string;
// }

// export interface ShippingSettingsResponse {
//   success?: boolean;
//   statusCode?: number;
//   message?: string;
//   data: ShippingSettingsData;
// }

// export interface ProductShippingFields {
//   shipping_type?: string;
//   shipping_config?: ShippingConfigEntry[] | string;
// }

// export type CartItemWithShipping = CartItem & {
//   isExternal?: boolean;
//   shipping_config?: ShippingConfigEntry[] | string;
//   product?: ProductShippingFields;
// };
// // api global settings fetch
// export const fetchShippingSettings =
//   async (): Promise<ShippingSettingsData | null> => {
//     try {
//       const res = await apiFetch("/shipping-settings", { method: "GET" });
//       if (!res.ok) return null;
//       const json = (await res.json()) as ShippingSettingsResponse;
//       return json.data || null;
//     } catch (error) {
//       console.error("Error fetching shipping settings:", error);
//       return null;
//     }
//   };

// export interface ShippingConfigEntry {
//   zone?: string;
//   charge?: number | string;
// }

// export interface ItemShippingBreakdown {
//   cartItemId: string;
//   shippingType: string;
//   itemShippingFee: number;
// }
// // calculate cart shipping details
// export const calculateCartShippingDetails = (
//   cartItems: CartItemWithShipping[],
//   shippingArea: string, // "inside" | "outside" | "sub_city"
//   shippingSettings?: ShippingSettingsData | null,
// ): { totalShippingFee: number; itemShippingFees: ItemShippingBreakdown[] } => {
//   if (!cartItems || cartItems.length === 0) {
//     return { totalShippingFee: 0, itemShippingFees: [] };
//   }

//   // gobla settings defult value
//   const courierConfig = shippingSettings?.courier_config;
//   const zoneDefaultFee =
//     shippingArea === "inside"
//       ? Number(courierConfig?.inside) || 120
//       : shippingArea === "sub_city"
//         ? Number(courierConfig?.sub_city) || 100
//         : Number(courierConfig?.outside) || 150;

//   // zone match for database
//   const isInside = shippingArea === "inside";
//   const isOutside = shippingArea === "outside";
//   const isSubCity = shippingArea === "sub_city";

//   // cart er item
//   const itemShippingFees: ItemShippingBreakdown[] = cartItems.map((item) => {
//     // mohasagor / external product
//     const isExternal =
//       item.productId?.startsWith("mohasagor-") || item.isExternal;

//     const prod: ProductShippingFields = item.product || {};
//     const sType = String(prod.shipping_type || "DEFAULT").toUpperCase();
//     const rawConfig = prod.shipping_config || item.shipping_config;

//     let fee = zoneDefaultFee;

//     if (isExternal) {
//       fee = zoneDefaultFee;
//     } else if (sType === "FREE") {
//       fee = 0;
//     } else if (sType === "CUSTOM" && rawConfig) {
//       let parsedConfig: ShippingConfigEntry[] = [];
//       try {
//         parsedConfig =
//           typeof rawConfig === "string" ? JSON.parse(rawConfig) : rawConfig;
//       } catch (e) {
//         parsedConfig = [];
//       }

//       // zone match for database
//       const match = parsedConfig.find((sc) => {
//         const z = String(sc.zone || "")
//           .trim()
//           .toLowerCase();
//         if (
//           isInside &&
//           (z === "dhaka" || (z.includes("dhaka") && !z.includes("outside")))
//         )
//           return true;
//         if (isOutside && (z.includes("outside") || z !== "dhaka")) return true;
//         if (isSubCity && z.includes("sub")) return true;
//         return false;
//       });

//       if (match && match.charge !== undefined && match.charge !== null) {
//         fee = Number(match.charge);
//       } else {
//         fee =
//           parsedConfig.length > 0 && parsedConfig[0].charge !== undefined
//             ? Number(parsedConfig[0].charge)
//             : zoneDefaultFee;
//       }
//     } else {
//       fee = zoneDefaultFee;
//     }

//     return {
//       cartItemId: String(item.id),
//       shippingType: sType,
//       itemShippingFee: fee,
//     };
//   });
//   //final calculation
//   const nonFreeFees = itemShippingFees
//     .map((it) => it.itemShippingFee)
//     .filter((fee) => fee >= 0);

//   const totalShippingFee =
//     nonFreeFees.length > 0 ? Math.max(...nonFreeFees) : zoneDefaultFee;

//   return {
//     totalShippingFee,
//     itemShippingFees,
//   };
// };

// // update shipping charge
// export const updateShippingSettings = async (
//   payload: Partial<ShippingSettingsData>,
// ): Promise<ShippingSettingsData> => {
//   const token = Cookies.get("accessToken");

//   const response = await apiFetch("/shipping-settings", {
//     method: "PATCH",
//     headers: {
//       "Content-Type": "application/json",
//       ...(token && { Authorization: `Bearer ${token}` }),
//     },
//     body: JSON.stringify(payload),
//   });

//   if (!response.ok) {
//     const errorData = await response.json().catch(() => ({}));
//     throw new Error(errorData.message || "Failed to update shipping settings");
//   }

//   const result: ShippingSettingsResponse = await response.json();
//   return result.data;
// };

import { apiFetch } from "@/utils/api";
import { CartItem } from "@/@types/order.type";

// New zones-based format from backend
export interface ShippingZone {
  id?: number;
  zone: string;
  inside: number;
  outside: number;
  subcity?: number;
}

export interface CourierConfig {
  // New format: zones array
  zones?: ShippingZone[];
  // Old flat format (kept for backward compat)
  inside?: number;
  outside?: number;
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

/**
 * Resolves the default shipping fee for a given area from courier_config.
 * Supports both the new zones-array format and the old flat format.
 */
export const resolveZoneFee = (
  courierConfig: CourierConfig | undefined | null,
  shippingArea: string,
): number => {
  if (!courierConfig) {
    return shippingArea === "inside"
      ? 60
      : shippingArea === "sub_city"
        ? 100
        : 120;
  }

  // New format: zones array — use the first zone entry
  if (courierConfig.zones && courierConfig.zones.length > 0) {
    const zone = courierConfig.zones[0];
    if (shippingArea === "inside") return Number(zone.inside) || 60;
    if (shippingArea === "sub_city") return Number(zone.subcity) || 100;
    return Number(zone.outside) || 120;
  }

  // Old flat format fallback
  if (shippingArea === "inside") return Number(courierConfig.inside) || 60;
  if (shippingArea === "sub_city") return Number(courierConfig.sub_city) || 100;
  return Number(courierConfig.outside) || 120;
};

/**
 * A single selectable option in the checkout shipping dropdown.
 * `shippingArea` ("inside" | "outside" | "sub_city") is what the backend expects on order creation.
 */
export interface ZoneShippingOption {
  key: string; // e.g. "1_inside", "2_subcity"
  label: string; // e.g. "Dhaka Inside", "Chittagong Sub City"
  fee: number;
  shippingArea: "inside" | "outside" | "sub_city";
  zoneName: string;
}

export const buildZoneShippingOptions = (
  courierConfig: CourierConfig | undefined | null,
): ZoneShippingOption[] => {
  if (!courierConfig?.zones || courierConfig.zones.length === 0) return [];

  const options: ZoneShippingOption[] = [];
  courierConfig.zones.forEach((zone) => {
    const id = zone.id ?? Math.random();
    const name = zone.zone || "Zone";

    if (Number(zone.inside) > 0) {
      options.push({
        key: `${id}_inside`,
        label: `${name} Inside`,
        fee: Number(zone.inside),
        shippingArea: "inside",
        zoneName: name,
      });
    }
    if (Number(zone.outside) > 0) {
      options.push({
        key: `${id}_outside`,
        label: `${name} Outside`,
        fee: Number(zone.outside),
        shippingArea: "outside",
        zoneName: name,
      });
    }
    if (Number(zone.subcity) > 0) {
      options.push({
        key: `${id}_subcity`,
        label: `${name} Sub City`,
        fee: Number(zone.subcity),
        shippingArea: "sub_city",
        zoneName: name,
      });
    }
  });
  return options;
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
export const calculateCartShippingDetails = (
  cartItems: CartItemWithShipping[],
  shippingArea: string, // "inside" | "outside" | "sub_city"
  shippingSettings?: ShippingSettingsData | null,
  defaultFeeOverride?: number,
): { totalShippingFee: number; itemShippingFees: ItemShippingBreakdown[] } => {
  if (!cartItems || cartItems.length === 0) {
    return { totalShippingFee: 0, itemShippingFees: [] };
  }

  // Resolve default fee: use override if provided (specific zone), else read from settings
  const courierConfig = shippingSettings?.courier_config;
  const zoneDefaultFee =
    defaultFeeOverride !== undefined
      ? defaultFeeOverride
      : resolveZoneFee(courierConfig, shippingArea);

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

export interface AddZonePayload {
  zone: string;
  inside: number;
  outside: number;
  subcity?: number;
}
export const addShippingZone = async (
  newZone: AddZonePayload,
  defaultShippingFee?: string | number,
): Promise<ShippingSettingsData | null> => {
  try {
    // 1. Current settings
    const current = await fetchShippingSettings();

    const existingZones: ShippingZone[] = current?.courier_config?.zones || [];

    // 2. Duplicate zone name
    const alreadyExists = existingZones.some(
      (z) => z.zone.trim().toLowerCase() === newZone.zone.trim().toLowerCase(),
    );
    if (alreadyExists) {
      throw new Error(`Zone "${newZone.zone}" already exists`);
    }

    const nextId =
      existingZones.length > 0
        ? Math.max(...existingZones.map((z) => z.id || 0)) + 1
        : 1;

    const updatedZones: ShippingZone[] = [
      ...existingZones,
      {
        id: nextId,
        zone: newZone.zone,
        inside: newZone.inside,
        outside: newZone.outside,
        subcity: newZone.subcity ?? 0,
      },
    ];

    // 4. payload send
    const payload = {
      default_shipping_fee:
        defaultShippingFee ?? current?.default_shipping_fee ?? 0,
      courier_config: {
        zones: updatedZones,
      },
    };

    // 5. PATCH call
    const res = await apiFetch("/shipping-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("Failed to add shipping zone:", res.status);
      return null;
    }

    const json = (await res.json()) as ShippingSettingsResponse;
    return json.data || null;
  } catch (error) {
    console.error("Error adding shipping zone:", error);
    return null;
  }
};

// react-query key used everywhere shipping settings are read/written,
// so cache invalidation always hits the same entry
export const SHIPPING_SETTINGS_QUERY_KEY = ["shipping-settings"] as const;

export interface UpdateShippingSettingsPayload {
  default_shipping_fee?: string | number;
  courier_config: CourierConfig;
}

export const updateShippingSettings = async (
  payload: UpdateShippingSettingsPayload,
): Promise<ShippingSettingsData> => {
  const res = await apiFetch("/shipping-settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = "Failed to update shipping settings";
    try {
      const errJson = await res.json();
      message = errJson?.message || message;
    } catch {
      // ignore parse errors, fall back to default message
    }
    throw new Error(message);
  }

  const json = (await res.json()) as ShippingSettingsResponse;
  return json.data;
};
