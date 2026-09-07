import { apiFetch } from "@/utils/api";

export interface MarketingSettingsData {
  sitemapEnabled: boolean;
  gtmId: string;
  googleVerificationCode: string;
  fbFeedEnabled: boolean;
  fbPixelId: string;
  fbPixelAccessToken: string;
  fbPixelTestEventId: string;
  fbDomainVerificationCode: string;
  tiktokPixelId: string;
  tiktokPixelAccessToken: string;
  tiktokTestEventId: string;
  baseScript: string;
}

export interface MarketingSettingsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: MarketingSettingsData;
}

export type UpdateMarketingSettingsPayload = Partial<MarketingSettingsData>;

export const fetchMarketingSettings =
  async (): Promise<MarketingSettingsData> => {
    const res = await apiFetch("/marketing-settings", { method: "GET" });
    if (!res.ok) {
      let message = "Failed to load marketing settings";
      try {
        const errJson = await res.json();
        message = errJson?.message || message;
      } catch {
        // ignore JSON parse error
      }
      throw new Error(message);
    }
    const json: MarketingSettingsResponse = await res.json();
    return json.data;
  };

export const updateMarketingSettings = async (
  payload: UpdateMarketingSettingsPayload,
): Promise<MarketingSettingsData> => {
  const res = await apiFetch("/marketing-settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = "Failed to update marketing settings";
    try {
      const errJson = await res.json();
      message = errJson?.message || message;
    } catch {
      // ignore JSON parse error
    }
    throw new Error(message);
  }

  const json: MarketingSettingsResponse = await res.json();
  return json.data;
};
