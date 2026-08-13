export const extractImageUrl = (candidate: any, backendBaseUrl?: string): string => {
  if (!candidate) return "";

  const baseUrl =
    backendBaseUrl ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
    "http://localhost:8082";

  let raw = candidate;

  // 1. If string, check if it's JSON array/object
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        raw = JSON.parse(trimmed);
      } catch {
        // keep as original string
      }
    }
  }

  // 2. If Array, take first non-empty element recursively
  if (Array.isArray(raw) && raw.length > 0) {
    for (const item of raw) {
      const extracted = extractImageUrl(item, baseUrl);
      if (extracted) return extracted;
    }
  }

  // 3. If Object with url/image_url/image property
  if (typeof raw === "object" && raw !== null) {
    const imgUrl = (raw as any).url || (raw as any).image_url || (raw as any).image;
    if (imgUrl) {
      return extractImageUrl(imgUrl, baseUrl);
    }
  }

  // 4. If string
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return "";
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("/images/")
    ) {
      return trimmed;
    }
    return `${baseUrl}/${trimmed.replace(/^\/+/, "")}`;
  }

  return "";
};
