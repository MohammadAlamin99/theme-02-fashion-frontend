import { apiFetch } from "@/utils/api";

// export interface PaymentSettingsData {
//   id: number;
//   cod_enabled: boolean;
//   online_payment_enabled: boolean;
//   updated_at?: string;
// }
export interface PaymentSettingsData {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    id: number;
    cod_enabled: boolean;
    online_payment_enabled: boolean;
    updated_at: string;
  };
}
export interface PaymentSettingsResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data: PaymentSettingsData;
}

export interface UpdatePaymentSettingsPayload {
  cod_enabled?: boolean;
  online_payment_enabled?: boolean;
}

// react-query key used everywhere payment settings are read/written,
// so cache invalidation always hits the same entry
export const PAYMENT_SETTINGS_QUERY_KEY = ["payment-settings"] as const;

/**
 * Fetches current payment settings (COD / online payment toggles).
 * Throws on failure so react-query's isError state works correctly.
 */
export const fetchPaymentSettings = async (): Promise<PaymentSettingsData> => {
  const res = await apiFetch("/payment-settings", { method: "GET" });
  if (!res.ok) {
    throw new Error("Failed to load payment settings");
  }
  const json = (await res.json()) as PaymentSettingsResponse;
  return json.data;
};

/**
 * Updates payment settings. Backend upserts, so a partial payload
 * (e.g. just { cod_enabled: false }) is fine — it won't wipe the other field.
 */
export const updatePaymentSettings = async (
  payload: UpdatePaymentSettingsPayload,
): Promise<PaymentSettingsData> => {
  const res = await apiFetch("/payment-settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = "Failed to update payment settings";
    try {
      const errJson = await res.json();
      message = errJson?.message || message;
    } catch {
      // ignore parse errors, fall back to default message
    }
    throw new Error(message);
  }

  const json = (await res.json()) as PaymentSettingsResponse;
  return json.data;
};
