import { apiFetch } from "@/utils/api";
import { getAdminTokenAction } from "@/app/actions/auth";

export const notificationApi = {
  async getRecent() {
    const token = await getAdminTokenAction();
    const res = await apiFetch("/notifications", {
      method: "GET",
      headers: { Authorization: `Bearer ${token || ""}` },
    });
    const json = await res.json();
    const data = json?.data || json || [];
    
    // 🚀 FILTER: Only return ORDER and REVIEW types to the UI
    return Array.isArray(data) 
      ? data.filter((n: any) => n.type === 'ORDER' || n.type === 'REVIEW') 
      : [];
  },

  async markAsRead(id: string) {
    const token = await getAdminTokenAction();
    const res = await apiFetch(`/notifications/${id}/read`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token || ""}` },
    });
    return res.json();
  },

  async markAllRead() {
    const token = await getAdminTokenAction();
    const res = await apiFetch("/notifications/read-all", {
      method: "POST",
      headers: { Authorization: `Bearer ${token || ""}` },
    });
    return res.json();
  }
};