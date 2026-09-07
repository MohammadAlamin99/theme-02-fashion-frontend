import { apiFetch } from "@/utils/api";

export interface SmsProvider {
  providerId: string;
  name: string;
  senderId?: string;
  apiKey?: string;
  apiSecret?: string;
  isActive: boolean;
  isConfigured: boolean;
}

export interface SmsTriggers {
  orderPlaced?: boolean;
  orderConfirmed?: boolean;
  orderDelivered?: boolean;
  orderCanceled?: boolean;
  adminNotification?: boolean;
  accountRegistered?: boolean;
  accountLogin?: boolean;
}

export interface SmsSettingsData {
  id: string;
  activeProvider: string | null;
  providers: SmsProvider[];
  triggers: SmsTriggers;
  orderMessage: string | null;
  authMessage: string | null;
  adminMessage: string | null;
  updatedAt?: string;
}

export interface SaveSmsProviderPayload {
  providerId: string;
  name: string;
  senderId?: string;
  apiKey?: string;
  apiSecret?: string;
  isActive: boolean;
}

export interface UpdateSmsSettingsPayload {
  activeProvider?: string;
  providers?: SmsProvider[];
  triggers?: SmsTriggers;
  orderMessage?: string;
  authMessage?: string;
  adminMessage?: string;
}

export interface SendTestSmsPayload {
  phone: string;
  message: string;
  providerId?: string;
}

export const fetchSmsSettings = async (): Promise<SmsSettingsData> => {
  const res = await apiFetch("/admin/sms-settings", { method: "GET" });
  if (!res.ok) {
    throw new Error("Failed to load SMS settings");
  }
  const json = await res.json();
  return json?.data !== undefined ? json.data : json;
};

export const updateSmsSettings = async (
  payload: UpdateSmsSettingsPayload,
): Promise<SmsSettingsData> => {
  const res = await apiFetch("/admin/sms-settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = "Failed to update SMS settings";
    try {
      const errJson = await res.json();
      message = errJson?.message || message;
    } catch {}
    throw new Error(message);
  }

  const json = await res.json();
  return json?.data !== undefined ? json.data : json;
};

export const saveSmsProviderCredentials = async (
  payload: SaveSmsProviderPayload,
): Promise<SmsSettingsData> => {
  const res = await apiFetch("/admin/sms-settings/provider", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = "Failed to save SMS provider credentials";
    try {
      const errJson = await res.json();
      message = errJson?.message || message;
    } catch {}
    throw new Error(message);
  }

  const json = await res.json();
  return json?.data !== undefined ? json.data : json;
};

export const sendTestSms = async (
  payload: SendTestSmsPayload,
): Promise<{ success: boolean; message: string }> => {
  const res = await apiFetch("/admin/sms-settings/send-test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = "Failed to send test SMS";
    try {
      const errJson = await res.json();
      message = errJson?.message || message;
    } catch {}
    throw new Error(message);
  }

  const json = await res.json();
  return json?.data !== undefined ? json.data : json;
};
