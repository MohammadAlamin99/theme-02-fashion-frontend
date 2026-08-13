import { apiFetch } from "@/utils/api";
import { getAdminTokenAction } from "@/app/actions/auth";

export const inventoryApi = {
  async getDashboard(search: string, sortBy: string, threshold = 5) {
    const token = await getAdminTokenAction();
    const query = new URLSearchParams({
      search,
      sortBy,
      lowStockThreshold: String(threshold),
    });

    const res = await apiFetch(`/inventory/dashboard?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token || ""}` },
    });

    const result = await res.json();
    // 🚀 Return the 'data' property because that's where your API payload lives
    return result.data;
  },

  async updateThreshold(threshold: number) {
    const token = await getAdminTokenAction();

    const res = await apiFetch(`/inventory/threshold`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || ""}`,
      },
      body: JSON.stringify({ threshold }),
    });

    return res.json();
  },
};
