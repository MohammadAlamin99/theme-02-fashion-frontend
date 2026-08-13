// import { apiFetch } from "@/utils/api";
// import { getAdminTokenAction } from "@/app/actions/auth";

// export const fetchAllUnits = async (query: any) => {
//   const params = new URLSearchParams(query);
//   const res = await apiFetch(`/units?${params.toString()}`);
//   if (!res.ok) throw new Error("Failed to fetch units.");
//   return res.json(); // Expected format: { data: [], meta: {} }
// };

// export const fetchSingleUnit = async (id: string) => {
//   const res = await apiFetch(`/units/${id}`);
//   if (!res.ok) throw new Error("Failed to fetch unit.");
//   return res.json();
// };

// export const createUnit = async (payload: any) => {
//   const token = await getAdminTokenAction();
//   const res = await apiFetch("/units", {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(payload),
//   });
//   if (!res.ok) throw new Error("Failed to create unit.");
//   return res.json();
// };

// export const updateUnit = async (id: string, payload: any) => {
//   const token = await getAdminTokenAction();
//   const res = await apiFetch(`/units/${id}`, {
//     method: "PATCH",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(payload),
//   });
//   if (!res.ok) throw new Error("Failed to update unit.");
//   return res.json();
// };

// export const deleteUnit = async (id: string) => {
//   const token = await getAdminTokenAction();
//   const res = await apiFetch(`/units/${id}`, {
//     method: "DELETE",
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   if (!res.ok) throw new Error("Failed to delete unit.");
//   return res.json();
// };
