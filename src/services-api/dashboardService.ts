import { apiFetch } from "@/utils/api";
import { getAdminTokenAction } from "@/app/actions/auth";

export interface SellReportQuery {
  page?: number;
  limit?: number;
  customDate?: string;
}

export const dashboardApi = {
  /**
   * Main Statistics: Overview, Order Lifecycle, Charts, and Top Best Sellers
   */
  async getStatistics(filter: string, customDate?: string) {
    const token = await getAdminTokenAction();
    const params = new URLSearchParams();

    // ⚡ Map UI Labels to Backend expected strings
    let mappedFilter = "month";
    const raw = filter.toLowerCase().replace(" ", "");

    if (raw === "day") mappedFilter = "day";
    if (raw === "year") mappedFilter = "year";
    if (raw === "alltime" || raw === "all") mappedFilter = "all";
    if (raw === "custom") mappedFilter = "custom";

    params.append("filter", mappedFilter);
    if (customDate) params.append("customDate", customDate);

    const res = await apiFetch(
      `/admin/dashboard/statistics?${params.toString()}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token || ""}` },
      },
    );

    if (!res.ok) throw new Error("Failed to fetch dashboard statistics");
    return res.json();
  }, // 🚀 Fixed: Added missing comma

  /**
   * Detailed Paginated Product Sell Report for the Modal
   */
  async getSellReport(query: SellReportQuery) {
    const token = await getAdminTokenAction();
    const params = new URLSearchParams();

    if (query.page) params.append("page", String(query.page));
    if (query.limit) params.append("limit", String(query.limit));
    if (query.customDate) params.append("customDate", query.customDate);

    const res = await apiFetch(
      `/admin/dashboard/sell-report?${params.toString()}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token || ""}` },
      },
    );

    if (!res.ok) throw new Error("Failed to fetch sell report");

    const json = await res.json();
    // Return the nested data object to match your ProductAnalytics component expectations
    return json?.data || json;
  },
  /**
   * 🌐 Public Storefront Visitor Stats (no auth required)
   * Returns: onlineNow, todayVisitors, totalVisitors
   */
  async getVisitorStats() {
    const res = await apiFetch(`/admin/dashboard/visitor-stats`, {
      method: "GET",
    });

    if (!res.ok) throw new Error("Failed to fetch visitor stats");
    const json = await res.json();
    return (json?.data || json) as {
      onlineNow: number;
      onlineByDevice: { mobile: number; desktop: number; tab: number };
      todayVisitors: number;
      totalVisitors: number;
    };
  },
};
