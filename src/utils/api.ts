// import { getCookie } from "cookies-next";

// const PUBLIC_API_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8082/api/v1";

// const INTERNAL_API_URL = process.env.API_INTERNAL_URL || PUBLIC_API_URL;

// const BASE_URL =
//   typeof window === "undefined" ? INTERNAL_API_URL : PUBLIC_API_URL;

// export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
//   const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

//   let token: string | undefined | null = null;

//   if (typeof window !== "undefined") {
//     token =
//       (getCookie("admin_token") as string) ||
//       (getCookie("auth_token") as string) ||
//       (getCookie("token") as string) ||
//       localStorage.getItem("token");
//   } else {
//     try {
//       const { cookies } = await import("next/headers");
//       const cookieStore = await cookies();
//       token =
//         cookieStore.get("admin_token")?.value ||
//         cookieStore.get("auth_token")?.value ||
//         cookieStore.get("token")?.value;
//     } catch {
//       token = null;
//     }
//   }

//   const headers: Record<string, string> = {
//     ...(options.headers as Record<string, string>),
//   };

//   if (token) {
//     headers["Authorization"] = `Bearer ${token}`;
//   }

//   if (!(options.body instanceof FormData)) {
//     headers["Content-Type"] = headers["Content-Type"] || "application/json";
//   } else {
//     delete headers["Content-Type"];
//   }

//   return fetch(url, {
//     ...options,
//     headers,
//     credentials: "include",
//   });
// };

import { getCookie } from "cookies-next";

const PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8082/api/v1";
const INTERNAL_API_URL = process.env.API_INTERNAL_URL || PUBLIC_API_URL;
const BASE_URL =
  typeof window === "undefined" ? INTERNAL_API_URL : PUBLIC_API_URL;

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  let token: string | undefined | null = null;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // --- START OF FIX: Context Awareness ---
  if (typeof window !== "undefined") {
    // Determine if we are on the Admin side or Storefront side
    const isAdminPath = window.location.pathname.startsWith("/admin");

    if (isAdminPath) {
      token = getCookie("admin_token") as string;
      headers["x-admin-request"] = "true";
    } else {
      // Prioritize customer tokens on storefront
      token =
        (getCookie("auth_token") as string) || (getCookie("token") as string);
      headers["x-customer-request"] = "true";
    }

    // Last resort fallback if specific token not found
    if (!token) token = localStorage.getItem("token");
  } else {
    // Server-side logic (e.g., SSR or Server Actions)
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();

      // On server side, check headers to see if we're proxying an admin request
      // This is often passed manually or detected via the incoming request URL
      token =
        cookieStore.get("admin_token")?.value ||
        cookieStore.get("auth_token")?.value ||
        cookieStore.get("token")?.value;
    } catch {
      token = null;
    }
  }
  // --- END OF FIX ---

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
