const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8083/api/v1";

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  // 1. Prepare default headers
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // 2. Only add JSON Content-Type if the body is NOT FormData
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
