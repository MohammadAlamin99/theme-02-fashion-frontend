import { apiFetch } from "@/utils/api";

export const fetchAdminStaff = async (params: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}) => {
  // Convert params object to query string
  const query = new URLSearchParams(params as any).toString();

  const res = await apiFetch(`/users/admin/staff?${query}`);

  if (!res.ok) throw new Error("Failed to fetch admin staff");
  const data = await res.json();
  console.log("Admin staff fetched successfully:", data);
  return data;
};

export const createAdmin = async (payload: any) => {
  const res = await apiFetch("/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to create admin");
  }
  return await res.json();
};

export const deleteAdmin = async (id: string) => {
  const res = await apiFetch(`/users/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete admin");
  return await res.json();
};

export const fetchAdminById = async (id: string) => {
  const res = await apiFetch(`/users/${id}`);
  if (!res.ok) throw new Error("Failed to fetch admin details");
  const result = await res.json();
  // Based on your logs, we need the .data property
  return result.data || result;
};
