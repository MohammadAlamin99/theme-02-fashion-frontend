import { NextResponse } from "next/server";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8082/api/v1";

// In-memory token cache (server-side module scope — persists between requests in same process)
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getServiceToken(): Promise<string | null> {
  const now = Date.now();

  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && now < tokenExpiry - 5 * 60 * 1000) {
    return cachedToken;
  }

  try {
    const phone = process.env.ADMIN_PHONE;
    const password = process.env.ADMIN_PASSWORD;

    if (!phone || !password) return null;

    const res = await fetch(`${BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();
    const token =
      data.accessToken ||
      data.token ||
      data.data?.accessToken ||
      null;

    if (!token) return null;

    // Decode JWT expiry
    try {
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64url").toString("utf8"),
      );
      tokenExpiry = (payload.exp || 0) * 1000;
    } catch {
      tokenExpiry = now + 6 * 60 * 60 * 1000; // fallback: 6h
    }

    cachedToken = token;
    return token;
  } catch {
    return null;
  }
}

/**
 * Public proxy for chat settings.
 * Store front calls /api/chat-settings → this route fetches from backend with admin auth.
 */
export async function GET() {
  try {
    const token = await getServiceToken();

    const res = await fetch(`${BASE_URL}/admin/chat-settings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({}, { status: 200 });
    }

    const json = await res.json();
    const data = json?.data ?? json;

    return NextResponse.json(data, {
      status: 200,
      headers: {
        // Cache for 30 seconds in browser, always revalidate
        "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
      },
    });
  } catch {
    return NextResponse.json({}, { status: 200 });
  }
}
