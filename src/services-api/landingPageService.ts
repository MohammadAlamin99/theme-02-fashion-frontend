// landingPageService.ts
import { apiFetch } from "@/utils/api";
import { getAdminTokenAction } from "@/app/actions/auth";
import { CreateLandingPageDto } from "../@types/landing-page";

export const saveLandingPage = async (payload: CreateLandingPageDto) => {
  const token = await getAdminTokenAction();
  const res = await apiFetch("/landing-pages/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ""}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to save landing page");
  }
  return await res.json();
};

export const uploadLandingPageMedia = async (files: FileList) => {
  const token = await getAdminTokenAction();
  const formData = new FormData();
  formData.append("image", files[0]);

  const res = await apiFetch("/landing-pages/upload", { 
    method: "POST",
    headers: { Authorization: `Bearer ${token || ""}` },
    body: formData,
  });

  const result = typeof res?.json === 'function' ? await res.json() : res;

  // 🚀 EXACT PATH BASED ON YOUR CONSOLE LOG:
  const url = 
    result?.data?.data?.image_url ||  // <--- This matches your exact double-wrapped structure!
    result?.data?.image_url || 
    result?.image_url;

  if (!url) {
    console.error("Server response structure received:", result);
    throw new Error("Upload failed: Could not parse image URL from response.");
  }

  return [url];
};

export const fetchAllProductsForLP = async () => {
  const res = await apiFetch(`/products?limit=1000&bypassCache=true`);
  const json = await res.json();
  const records = json?.data?.data || json?.data || json || [];
  return Array.isArray(records) ? records : [];
};

export const fetchLandingPageByProductId = async (productId: string) => {
  const token = await getAdminTokenAction();
  const res = await apiFetch(`/landing-pages/product/${productId}`, {
    headers: { Authorization: `Bearer ${token || ""}` },
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data || json;
};

export const fetchLandingPageBySlug = async (slug: string) => {
  const res = await apiFetch(`/landing-pages/view/${slug}`, {
    headers: { "X-Customer-Request": "true" },
  });
  if (!res.ok) return null;
  return await res.json();
};
