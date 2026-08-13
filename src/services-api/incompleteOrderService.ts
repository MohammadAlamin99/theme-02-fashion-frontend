import { apiFetch } from "@/utils/api";
import { getAdminTokenAction } from "@/app/actions/auth";


export const getAllIncompleteOrdersService = async (params: { page: number; limit: number }) => {
  const token = await getAdminTokenAction();
  const res = await apiFetch(`/incomplete-orders?page=${params.page}&limit=${params.limit}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token || ""}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error("Failed to fetch incomplete orders");
  return res.json();
};

export const trackIncompleteOrder = async (payload: Record<string, unknown>) => {
  const token = await getAdminTokenAction();

  const res = await apiFetch("/incomplete-orders/track", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token || ""}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    console.warn("Tracking lead:", errorJson?.message);
    return null;
  }
  return res.json();
};

export const deleteIncompleteOrderService = async (id: string) => {
  const token = await getAdminTokenAction();
  const res = await apiFetch(`/incomplete-orders/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token || ""}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error("Failed to delete lead");
  return res.json();
};