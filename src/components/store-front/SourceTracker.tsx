"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

function resolveSource(utmSource: string | null, referrer: string): string {
  // Priority 1: explicit utm_source in URL
  if (utmSource) {
    const s = utmSource.toLowerCase();
    if (s.includes("facebook") || s.includes("fb")) return "Facebook";
    if (s.includes("instagram") || s.includes("ig")) return "Instagram";
    if (s.includes("google")) return "Google";
    if (s.includes("tiktok")) return "TikTok";
    if (s.includes("youtube")) return "YouTube";
    if (s.includes("twitter") || s.includes("x.com")) return "Twitter";
    if (s.includes("whatsapp")) return "WhatsApp";
    // Capitalise and return raw value for unknown sources
    return utmSource.charAt(0).toUpperCase() + utmSource.slice(1);
  }

  // Priority 2: document.referrer domain
  if (!referrer) return "direct";
  const r = referrer.toLowerCase();
  if (r.includes("facebook.com") || r.includes("fb.com")) return "Facebook";
  if (r.includes("instagram.com")) return "Instagram";
  if (r.includes("google.com") || r.includes("google.")) return "Google";
  if (r.includes("tiktok.com")) return "TikTok";
  if (r.includes("youtube.com")) return "YouTube";
  if (r.includes("twitter.com") || r.includes("x.com")) return "Twitter";
  if (r.includes("whatsapp.com")) return "WhatsApp";

  return "direct";
}

export default function SourceTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const utmSource = searchParams.get("utm_source");

    // If URL has utm_source, always use it (overrides any previously stored value)
    if (utmSource) {
      const source = resolveSource(utmSource, "");
      sessionStorage.setItem("order_source", source);
      return;
    }

    // No UTM — only capture from referrer if not already set
    if (sessionStorage.getItem("order_source")) return;

    const referrer = document.referrer || "";
    const source = resolveSource(null, referrer);
    sessionStorage.setItem("order_source", source);
  }, []); // runs once on mount (i.e., first page load of the session)

  return null; // renders nothing
}
