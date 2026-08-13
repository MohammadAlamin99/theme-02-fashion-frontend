import { apiFetch } from "@/utils/api";
import { getAdminTokenAction } from "@/app/actions/auth";

export const customerApi = {
  async getAll(page: number, limit: number, search: string, sort: string = "desc") {
    const token = await getAdminTokenAction();
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search: search,
      sortOrder: sort.toUpperCase(),
    });
    const res = await apiFetch(`/users/admin/all?${query.toString()}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token || ""}` }
    });
    return res.json();
  },

  async updateStatus(id: string, status: string) {
    const token = await getAdminTokenAction();
    const res = await apiFetch(`/users/admin-update/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token || ""}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    });
    return res.json();
  }
};