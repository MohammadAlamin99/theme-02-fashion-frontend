import { apiFetch } from "@/utils/api";
import { getAdminTokenAction } from "@/app/actions/auth";

// GET SETTINGS DATA
export const getSettings = async () => {
  const token = await getAdminTokenAction();

  const res = await apiFetch("/settings", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token || ""}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson?.message || "Failed to fetch settings data.");
  }

  return res.json();
};

//  UPDATE SETTINGS DATA
export const updateSettings = async (payload: Record<string, unknown>) => {
  const token = await getAdminTokenAction();

  const res = await apiFetch("/settings", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token || ""}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson?.message || "Failed to update settings.");
  }

  return res.json();
};
