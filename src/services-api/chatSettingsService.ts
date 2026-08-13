import { apiFetch } from "@/utils/api";

export const fetchChatSettings = async () => {
  const res = await apiFetch("/admin/chat-settings", { method: "GET" });
  const json = await res.json();
  // Unwrap backend envelope — return the actual settings object
  return json?.data ?? json;
};

export const updateChatSettings = async (data: Record<string, unknown>) => {
  const res = await apiFetch("/admin/chat-settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};