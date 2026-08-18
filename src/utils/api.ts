import { getCookie } from "cookies-next";

const PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8082/api/v1";

const INTERNAL_API_URL = process.env.API_INTERNAL_URL || PUBLIC_API_URL;

const BASE_URL =
  typeof window === "undefined" ? INTERNAL_API_URL : PUBLIC_API_URL;

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  let token: string | undefined | null = null;

  if (typeof window !== "undefined") {
    token =
      (getCookie("admin_token") as string) ||
      (getCookie("auth_token") as string) ||
      (getCookie("token") as string) ||
      localStorage.getItem("token");
  } else {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      token =
        cookieStore.get("admin_token")?.value ||
        cookieStore.get("auth_token")?.value ||
        cookieStore.get("token")?.value;
    } catch {
      token = null;
    }
  }

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  } else {
    delete headers["Content-Type"];
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });
};
